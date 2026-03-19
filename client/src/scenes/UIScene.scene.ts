import Phaser from "phaser";

import { SCENES } from "./scene.config";
import { phaserEvents, PhaserEvent } from "../events/eventManager";
import { mobileInput } from "../input/mobileInput";
import type { DialoguePayload, DialogueNavigatePayload } from "../dialogue/DialogueManager";

const DIALOGUE_BOX_HEIGHT = 140;
const DIALOGUE_BOX_MARGIN = 12;
const DIALOGUE_BOX_PADDING = 14;
const CHOICES_Y_OFFSET = 62; // y offset from boxY where choices start
const CHOICE_LINE_HEIGHT = 18;

// ── Mobile controls layout ────────────────────────────────────────────────────
const JOY_BASE_RADIUS = 50;
const JOY_THUMB_RADIUS = 24;
const JOY_X_MARGIN = 90;   // from left edge
const JOY_Y_MARGIN = 100;  // from bottom edge
const BTN_RADIUS = 32;
const BTN_ALPHA = 0.75;
// Dialogue nav buttons row is placed above the dialogue box
const DIAG_BTN_Y_ABOVE = 45; // px above boxY

export class UIScene extends Phaser.Scene {
  private zoneHint!: Phaser.GameObjects.Text;
  private zoneHintBg!: Phaser.GameObjects.Graphics;
  private dialogueBg!: Phaser.GameObjects.Graphics;
  private dialogueText!: Phaser.GameObjects.Text;
  private dialogueHint!: Phaser.GameObjects.Text;
  private choiceTexts: Phaser.GameObjects.Text[] = [];
  private boxY = 0;
  private boxW = 0;

  // Mobile controls
  private _isTouchDevice = false;
  private _safeBottom = 0;
  private _joyBase!: Phaser.GameObjects.Graphics;
  private _joyThumb!: Phaser.GameObjects.Graphics;
  private _joyBaseX = 0;
  private _joyBaseY = 0;
  private _joyPointerId: number | null = null;

  private _btnAttack!: Phaser.GameObjects.Container;
  private _btnInteract!: Phaser.GameObjects.Container;
  // Dialogue buttons (shown when dialogue is open)
  private _btnCycle!: Phaser.GameObjects.Container;   // cycle choices ↓
  private _btnConfirm!: Phaser.GameObjects.Container; // validate ✓
  private _btnClose!: Phaser.GameObjects.Container;   // close ✕
  private _dialogueOpen = false;
  private _inZone = false;
  private _hasChoices = false;
  private _pendingUrl: string | null = null;

  constructor() {
    super(SCENES.UI);
  }

  preload() {
    this.cameras.add(0, 0, this.sys.canvas.width, this.sys.canvas.height);
  }

  create() {
    this.scene.bringToTop();
    const W = this.scale.width;
    const H = this.scale.height;
    this._safeBottom = this._getSafeAreaBottom();
    this.boxY = H - DIALOGUE_BOX_HEIGHT - DIALOGUE_BOX_MARGIN - this._safeBottom;
    this.boxW = W - DIALOGUE_BOX_MARGIN * 2;

    // --- Zone hint ---
    this.zoneHint = this.add
      .text(W / 2, this.boxY - 8, "Appuyer sur Entrée pour parler", {
        fontSize: "13px",
        color: "#ffffff",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5, 1)
      .setDepth(1)
      .setVisible(false);

    const hintW = this.zoneHint.width;
    const hintH = this.zoneHint.height;
    const hintX = W / 2 - hintW / 2;
    const hintY = this.boxY - 8 - hintH;
    this.zoneHintBg = this.add.graphics()
      .fillStyle(0x0a0a0a, 0.88).fillRoundedRect(hintX, hintY, hintW, hintH, 6)
      .lineStyle(2, 0xffffff, 1).strokeRoundedRect(hintX, hintY, hintW, hintH, 6)
      .setDepth(0).setVisible(false);

    // --- Dialogue box background ---
    this.dialogueBg = this.add.graphics()
      .fillStyle(0x0a0a0a, 0.88)
      .fillRoundedRect(DIALOGUE_BOX_MARGIN, this.boxY, this.boxW, DIALOGUE_BOX_HEIGHT, 6)
      .lineStyle(2, 0xffffff, 1)
      .strokeRoundedRect(DIALOGUE_BOX_MARGIN, this.boxY, this.boxW, DIALOGUE_BOX_HEIGHT, 6)
      .setVisible(false);

    // --- Dialogue text ---
    this.dialogueText = this.add
      .text(DIALOGUE_BOX_MARGIN + DIALOGUE_BOX_PADDING, this.boxY + DIALOGUE_BOX_PADDING, "", {
        fontSize: "14px",
        color: "#ffffff",
        wordWrap: { width: this.boxW - DIALOGUE_BOX_PADDING * 2 },
        lineSpacing: 4,
      })
      .setVisible(false);

    // --- "Enter ▶" hint bottom-right ---
    this.dialogueHint = this.add
      .text(
        W - DIALOGUE_BOX_MARGIN - DIALOGUE_BOX_PADDING,
        this.boxY + DIALOGUE_BOX_HEIGHT - DIALOGUE_BOX_PADDING,
        "Entrée ▶",
        { fontSize: "11px", color: "#888888" }
      )
      .setOrigin(1, 1)
      .setVisible(false);

    // --- Mobile controls ---
    this._isTouchDevice = this.sys.game.device.input.touch;
    if (this._isTouchDevice) {
      this.input.addPointer(2); // support 3 simultaneous touches
      this._createMobileControls(W, H);
    }

    // --- Events ---
    const renderDialogue = ({ text, choices }: DialoguePayload) => {
      this._dialogueOpen = true;
      this._hasChoices = choices.length > 0;
      this.zoneHintBg.setVisible(false);
      this.zoneHint.setVisible(false);
      this.dialogueBg.setVisible(true);
      this.dialogueText.setText(text).setVisible(true);
      this.dialogueHint.setText(choices.length === 0 ? "Fermer ✕" : "Entrée ▶").setVisible(true);
      this._renderChoices(choices, 0);
      this._syncMobileButtons();
      // Always render UI on top of every other scene
      this.scene.bringToTop();
    };

    const onNavigate = ({ selectedIndex }: DialogueNavigatePayload) => {
      this.choiceTexts.forEach((t, i) => {
        t.setText(`${i === selectedIndex ? "▶ " : "  "}${t.getData("label")}`);
        t.setColor(i === selectedIndex ? "#ffffff" : "#888888");
      });
    };

    const onClose = () => {
      this._dialogueOpen = false;
      this._hasChoices = false;
      this._pendingUrl = null;
      this.dialogueBg.setVisible(false);
      this.dialogueText.setVisible(false);
      this.dialogueHint.setVisible(false);
      this._clearChoices();
      this._syncMobileButtons();
    };

    const ACTION_URLS: Record<string, string> = {
      open_linkedin: "https://fr.linkedin.com/in/erwan-gilbert-b184241b",
    };
    const onAction = (action: string) => {
      this._pendingUrl = ACTION_URLS[action] ?? null;
    };

    const onZoneEnter = () => {
      this._inZone = true;
      // On mobile the interact button replaces the text hint
      if (!this._isTouchDevice) {
        this.zoneHintBg.setVisible(true);
        this.zoneHint.setVisible(true);
      }
      this._syncMobileButtons();
    };
    const onZoneLeave = () => {
      this._inZone = false;
      this.zoneHintBg.setVisible(false);
      this.zoneHint.setVisible(false);
      this._syncMobileButtons();
    };

    phaserEvents.on(PhaserEvent.DIALOGUE_ZONE_ENTER, onZoneEnter);
    phaserEvents.on(PhaserEvent.DIALOGUE_ZONE_LEAVE, onZoneLeave);
    phaserEvents.on(PhaserEvent.DIALOGUE_OPEN, renderDialogue);
    phaserEvents.on(PhaserEvent.DIALOGUE_UPDATE, renderDialogue);
    phaserEvents.on(PhaserEvent.DIALOGUE_NAVIGATE, onNavigate);
    phaserEvents.on(PhaserEvent.DIALOGUE_CLOSE, onClose);
    phaserEvents.on(PhaserEvent.DIALOGUE_ACTION, onAction);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      phaserEvents.off(PhaserEvent.DIALOGUE_ZONE_ENTER, onZoneEnter);
      phaserEvents.off(PhaserEvent.DIALOGUE_ZONE_LEAVE, onZoneLeave);
      phaserEvents.off(PhaserEvent.DIALOGUE_OPEN, renderDialogue);
      phaserEvents.off(PhaserEvent.DIALOGUE_UPDATE, renderDialogue);
      phaserEvents.off(PhaserEvent.DIALOGUE_NAVIGATE, onNavigate);
      phaserEvents.off(PhaserEvent.DIALOGUE_CLOSE, onClose);
      phaserEvents.off(PhaserEvent.DIALOGUE_ACTION, onAction);
    });
  }

  // ── Mobile controls ─────────────────────────────────────────────────────────

  /** Returns the height of the bottom safe-area inset (gesture bar, notch, etc.) in Phaser pixels. */
  private _getSafeAreaBottom(): number {
    try {
      const el = document.createElement("div");
      el.style.cssText =
        "position:fixed;bottom:0;left:0;width:0;padding-bottom:env(safe-area-inset-bottom,0px);visibility:hidden;pointer-events:none";
      document.body.appendChild(el);
      const val = parseFloat(getComputedStyle(el).paddingBottom) || 0;
      document.body.removeChild(el);
      return val;
    } catch {
      return 0;
    }
  }

  private _createMobileControls(W: number, H: number) {
    const sb = this._safeBottom;

    // Joystick
    this._joyBaseX = JOY_X_MARGIN;
    this._joyBaseY = H - JOY_Y_MARGIN - sb;

    this._joyBase = this.add.graphics()
      .fillStyle(0x000000, 0.4)
      .fillCircle(0, 0, JOY_BASE_RADIUS)
      .lineStyle(2, 0xffffff, 0.5)
      .strokeCircle(0, 0, JOY_BASE_RADIUS)
      .setPosition(this._joyBaseX, this._joyBaseY)
      .setDepth(50);

    this._joyThumb = this.add.graphics()
      .fillStyle(0xffffff, 0.6)
      .fillCircle(0, 0, JOY_THUMB_RADIUS)
      .setPosition(this._joyBaseX, this._joyBaseY)
      .setDepth(51);

    // Attack button (bottom-right)
    this._btnAttack = this._makeButton(W - 70, H - 90 - sb, BTN_RADIUS, "⚔️", 0x555555);

    // Interact/Confirm button (left of attack)
    this._btnInteract = this._makeButton(W - 150, H - 90 - sb, BTN_RADIUS, "💬", 0x336699);
    this._btnInteract.setVisible(false);

    // Dialogue buttons – placed above the dialogue box
    // Layout: [↓ cycle — left]          [✓ confirm] [✕ close — right]
    const diagBtnY = this.boxY - DIAG_BTN_Y_ABOVE;
    const btnR = BTN_RADIUS - 4; // 28px radius → 56px diameter
    this._btnCycle   = this._makeButton(60,      diagBtnY, btnR, "↓", 0x445566);
    this._btnConfirm = this._makeButton(W - 105, diagBtnY, btnR, "✓", 0x336644);
    this._btnClose   = this._makeButton(W - 45,  diagBtnY, btnR, "✕", 0x664433);
    this._btnCycle.setVisible(false);
    this._btnConfirm.setVisible(false);
    this._btnClose.setVisible(false);

    // Wire up touch interactions
    this._setupJoystickInput();
    this._setupButtonInput(this._btnAttack,  () => { mobileInput.space = true; }, () => { mobileInput.space = false; });
    this._setupButtonInput(this._btnInteract, () => phaserEvents.emit(PhaserEvent.MOBILE_INTERACT));
    this._setupButtonInput(this._btnCycle,   () => phaserEvents.emit(PhaserEvent.MOBILE_NAV_DOWN));
    this._setupButtonInput(this._btnConfirm, () => phaserEvents.emit(PhaserEvent.MOBILE_INTERACT));
    this._setupButtonInput(this._btnClose,   () => phaserEvents.emit(PhaserEvent.MOBILE_CLOSE));

    // Native touchend listener to open URLs — window.open() requires a trusted
    // user-gesture call stack; Phaser's rAF loop breaks that on mobile browsers.
    const canvas = this.sys.game.canvas;
    canvas.addEventListener("touchend", (e: TouchEvent) => {
      if (!this._pendingUrl) return;
      const touch = e.changedTouches[0];
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const cx = (touch.clientX - rect.left) * scaleX;
      const cy = (touch.clientY - rect.top) * scaleY;
      const dx = cx - this._btnConfirm.x;
      const dy = cy - this._btnConfirm.y;
      if (Math.sqrt(dx * dx + dy * dy) <= btnR) {
        window.open(this._pendingUrl, "_blank", "noopener,noreferrer");
      }
    }, { passive: true });
  }

  /** Creates a circular button Container with background + label. */
  private _makeButton(
    x: number,
    y: number,
    radius: number,
    label: string,
    color: number
  ): Phaser.GameObjects.Container {
    const bg = this.add.graphics()
      .fillStyle(color, BTN_ALPHA)
      .fillCircle(0, 0, radius)
      .lineStyle(2, 0xffffff, 0.6)
      .strokeCircle(0, 0, radius);

    const txt = this.add.text(0, 0, label, {
      fontSize: `${Math.floor(radius * 0.7)}px`,
      resolution: 2,
      padding: { top: 2 },
    }).setOrigin(0.5);

    const container = this.add.container(x, y, [bg, txt]).setDepth(50);

    // Make the area interactive using a circle hit area
    const zone = this.add.zone(x, y, radius * 2, radius * 2)
      .setInteractive({ useHandCursor: false })
      .setDepth(51);
    container.setData("zone", zone);

    return container;
  }

  private _setupButtonInput(
    btn: Phaser.GameObjects.Container,
    onDown: () => void,
    onUp?: () => void
  ) {
    const zone = btn.getData("zone") as Phaser.GameObjects.Zone;
    zone.on("pointerdown", () => {
      this._highlightBtn(btn, true);
      onDown();
    });
    if (onUp) {
      zone.on("pointerup", () => { this._highlightBtn(btn, false); onUp(); });
      zone.on("pointerout", () => { this._highlightBtn(btn, false); onUp(); });
    } else {
      zone.on("pointerup",  () => this._highlightBtn(btn, false));
      zone.on("pointerout", () => this._highlightBtn(btn, false));
    }
  }

  private _highlightBtn(btn: Phaser.GameObjects.Container, pressed: boolean) {
    btn.setAlpha(pressed ? 0.6 : 1);
  }

  private _setupJoystickInput() {
    const onDown = (pointer: Phaser.Input.Pointer) => {
      if (this._joyPointerId !== null) return; // already tracking a touch
      const dx = pointer.x - this._joyBaseX;
      const dy = pointer.y - this._joyBaseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > JOY_BASE_RADIUS * 1.5) return; // not touching joystick area
      this._joyPointerId = pointer.id;
      this._updateJoystick(pointer.x, pointer.y);
    };

    const onMove = (pointer: Phaser.Input.Pointer) => {
      if (pointer.id !== this._joyPointerId) return;
      this._updateJoystick(pointer.x, pointer.y);
    };

    const onUp = (pointer: Phaser.Input.Pointer) => {
      if (pointer.id !== this._joyPointerId) return;
      this._joyPointerId = null;
      this._resetJoystick();
    };

    this.input.on("pointerdown", onDown);
    this.input.on("pointermove", onMove);
    this.input.on("pointerup",   onUp);
    this.input.on("pointerout",  onUp);
  }

  private _updateJoystick(px: number, py: number) {
    const dx = px - this._joyBaseX;
    const dy = py - this._joyBaseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, JOY_BASE_RADIUS);
    const angle = Math.atan2(dy, dx);

    const thumbX = this._joyBaseX + Math.cos(angle) * clampedDist;
    const thumbY = this._joyBaseY + Math.sin(angle) * clampedDist;
    this._joyThumb.setPosition(thumbX, thumbY);

    const deadzone = JOY_BASE_RADIUS * 0.25;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    mobileInput.left  = dx < -deadzone;
    mobileInput.right = dx >  deadzone;
    // Up/down only activate when the vertical component is significant
    // relative to the horizontal one, to avoid sticking when sliding left/right.
    mobileInput.up    = dy < -deadzone && absDy > absDx * 0.4;
    mobileInput.down  = dy >  deadzone && absDy > absDx * 0.4;
  }

  private _resetJoystick() {
    this._joyThumb.setPosition(this._joyBaseX, this._joyBaseY);
    mobileInput.left = mobileInput.right = mobileInput.up = mobileInput.down = false;
  }

  /** Show/hide mobile buttons depending on current dialogue/zone state. */
  private _syncMobileButtons() {
    if (!this._isTouchDevice) return;

    const dialogueOpen = this._dialogueOpen;
    const inZone       = this._inZone;
    const hasChoices   = this._hasChoices;

    // Joystick + attack hidden during dialogue (movement blocked anyway)
    this._joyBase.setVisible(!dialogueOpen);
    this._joyThumb.setVisible(!dialogueOpen);
    this._btnAttack.setVisible(!dialogueOpen);
    (this._btnAttack.getData("zone") as Phaser.GameObjects.Zone).setVisible(!dialogueOpen);

    // Interact button visible when in zone (open dialogue) or dialogue open (confirm)
    this._btnInteract.setVisible(!dialogueOpen && inZone);
    (this._btnInteract.getData("zone") as Phaser.GameObjects.Zone).setVisible(!dialogueOpen && inZone);

    // Dialogue buttons
    this._btnCycle.setVisible(dialogueOpen && hasChoices);
    (this._btnCycle.getData("zone") as Phaser.GameObjects.Zone).setVisible(dialogueOpen && hasChoices);
    this._btnConfirm.setVisible(dialogueOpen);
    (this._btnConfirm.getData("zone") as Phaser.GameObjects.Zone).setVisible(dialogueOpen);
    this._btnClose.setVisible(dialogueOpen);
    (this._btnClose.getData("zone") as Phaser.GameObjects.Zone).setVisible(dialogueOpen);

    if (!dialogueOpen) this._resetJoystick();
  }

  // ── Dialogue rendering (shared keyboard + touch) ─────────────────────────────

  private _renderChoices(choices: { label: string }[], selectedIndex: number) {
    this._clearChoices();
    choices.forEach((choice, i) => {
      const isSelected = i === selectedIndex;
      const t = this.add
        .text(
          DIALOGUE_BOX_MARGIN + DIALOGUE_BOX_PADDING,
          this.boxY + CHOICES_Y_OFFSET + i * CHOICE_LINE_HEIGHT,
          `${isSelected ? "▶ " : "  "}${choice.label}`,
          { fontSize: "13px", color: isSelected ? "#ffffff" : "#888888" }
        )
        .setData("label", choice.label);
      this.choiceTexts.push(t);
    });
  }

  private _clearChoices() {
    this.choiceTexts.forEach(t => t.destroy());
    this.choiceTexts = [];
  }
}
