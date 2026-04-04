import Phaser from "phaser";

import { SCENES } from "./scene.config";
import { phaserEvents, PhaserEvent } from "../events/eventManager";
import { mobileInput } from "../input/mobileInput";
import type { DialoguePayload, DialogueNavigatePayload } from "../dialogue/DialogueManager";
import { POTION_CONFIG } from "../../../shared/shared.config";

const DIALOGUE_BOX_HEIGHT = 140;    // fixed height on PC
const DIALOGUE_BOX_MIN_HEIGHT = 80; // minimum height on mobile (dynamic)
const DIALOGUE_BOX_MARGIN = 12;
const DIALOGUE_BOX_PC_SIDE_MARGIN = 80;  // side margin on desktop
const DIALOGUE_BOX_PC_BOTTOM_MARGIN = 28; // bottom margin on desktop
const DIALOGUE_BOX_PADDING = 14;
const CHOICES_Y_OFFSET = 62; // choices Y offset from boxY on PC (fixed layout)
const CHOICES_GAP = 8;       // gap between text and choices on mobile (dynamic)
const CHOICE_LINE_HEIGHT = 18;

// ── Mobile controls layout ────────────────────────────────────────────────────
const JOY_BASE_RADIUS = 50;
const JOY_THUMB_RADIUS = 24;
const JOY_X_MARGIN = 90;   // from left edge
const JOY_Y_MARGIN = 100;  // from bottom edge
const BTN_RADIUS = 32;
const BTN_ALPHA = 0.75;
// Bottom button row Y offset from bottom edge (attack, interact, dialogue nav)
const BTN_Y_FROM_BOTTOM = 90;

export class UIScene extends Phaser.Scene {
  private _killCount = 0;
  private _killBadge!: HTMLDivElement;
  private _killCountSpan!: HTMLSpanElement;

  private _coinBadge!: HTMLDivElement;
  private _coinCountSpan!: HTMLSpanElement;

  private _boostBadge!: HTMLDivElement;
  private _boostTimerSpan!: HTMLSpanElement;
  private _boostRemaining = 0;

  private zoneHint!: Phaser.GameObjects.Text;
  private zoneHintBg!: Phaser.GameObjects.Graphics;
  private dialogueBg!: Phaser.GameObjects.Graphics;
  private dialogueText!: Phaser.GameObjects.Text;
  private dialogueHint!: Phaser.GameObjects.Text;
  private choiceTexts: Phaser.GameObjects.Text[] = [];
  private boxX = 0;
  private boxY = 0;
  private boxW = 0;
  private _boxBottom = 0;   // fixed bottom edge of dialogue box (above controls)
  private _choicesStartY = 0; // Y where choices begin (set by _redrawDialogueBox)

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
  private _inPoiZone = false;
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
    this._isTouchDevice = this.sys.game.device.input.touch;
    this._safeBottom = this._getSafeAreaBottom();
    if (this._isTouchDevice) {
      // Mobile: box sits above the button row, height is dynamic
      this._boxBottom = H - BTN_Y_FROM_BOTTOM - BTN_RADIUS - DIALOGUE_BOX_MARGIN - this._safeBottom;
      this.boxY = this._boxBottom - DIALOGUE_BOX_MIN_HEIGHT;
      this.boxX = DIALOGUE_BOX_MARGIN;
      this.boxW = W - DIALOGUE_BOX_MARGIN * 2;
    } else {
      // PC: box with side and bottom margins
      this.boxY = H - DIALOGUE_BOX_HEIGHT - DIALOGUE_BOX_PC_BOTTOM_MARGIN - this._safeBottom;
      this._boxBottom = this.boxY + DIALOGUE_BOX_HEIGHT;
      this.boxX = DIALOGUE_BOX_PC_SIDE_MARGIN;
      this.boxW = W - DIALOGUE_BOX_PC_SIDE_MARGIN * 2;
    }

    // --- Zone hint ---
    this.zoneHint = this.add
      .text(W / 2, this.boxY - 8, "Appuyer sur Entrée pour parler", {
        fontSize: "13px",
        color: "#ffffff",
        padding: { x: 10, y: 5 },
        wordWrap: { width: W - DIALOGUE_BOX_MARGIN * 4 },
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setDepth(1)
      .setVisible(false);

    this.zoneHintBg = this.add.graphics().setDepth(0).setVisible(false);
    this._redrawHintBg();

    // --- Dialogue box background (drawn dynamically on each open) ---
    this.dialogueBg = this.add.graphics().setVisible(false);

    // --- Dialogue text ---
    this.dialogueText = this.add
      .text(this.boxX + DIALOGUE_BOX_PADDING, this.boxY + DIALOGUE_BOX_PADDING, "", {
        fontSize: "14px",
        color: "#ffffff",
        wordWrap: { width: this.boxW - DIALOGUE_BOX_PADDING * 2 },
        lineSpacing: 4,
      })
      .setVisible(false);

    // --- "Enter ▶" hint bottom-right ---
    this.dialogueHint = this.add
      .text(this.boxX + this.boxW - DIALOGUE_BOX_PADDING, 0, "Entrée ▶", {
        fontSize: "11px",
        color: "#888888",
      })
      .setOrigin(1, 1)
      .setVisible(false);

    // --- Slime kill counter (DOM overlay, top-right) ---
    this._killCount = 0;
    this._killBadge = document.createElement("div");
    this._killBadge.style.cssText =
      "position:fixed;top:12px;right:12px;display:flex;align-items:center;gap:6px;" +
      "background:rgba(0,0,0,0.6);padding:5px 10px;border-radius:8px;" +
      "border:1px solid rgba(255,255,255,0.3);z-index:10;pointer-events:none;";

    const slimeImg = document.createElement("img");
    slimeImg.src = "/assets/slime.gif";
    slimeImg.style.cssText = "width:40px;height:40px;image-rendering:pixelated;";

    this._killCountSpan = document.createElement("span");
    this._killCountSpan.style.cssText =
      "color:white;font-size:14px;font-family:monospace;font-weight:bold;";
    this._killCountSpan.textContent = "0";

    this._killBadge.appendChild(slimeImg);
    this._killBadge.appendChild(this._killCountSpan);
    (document.getElementById("root") ?? document.body).appendChild(this._killBadge);

    // --- Coin counter (DOM overlay, below kill badge) ---
    this._coinBadge = document.createElement("div");
    this._coinBadge.style.cssText =
      "position:fixed;top:66px;right:12px;display:flex;align-items:center;gap:6px;" +
      "background:rgba(0,0,0,0.6);padding:5px 10px;border-radius:8px;" +
      "border:1px solid rgba(255,255,255,0.3);z-index:10;pointer-events:none;";

    const coinImg = document.createElement("img");
    coinImg.src = "/assets/coin.gif";
    coinImg.style.cssText = "width:28px;height:28px;image-rendering:pixelated;";

    this._coinCountSpan = document.createElement("span");
    this._coinCountSpan.style.cssText =
      "color:white;font-size:14px;font-family:monospace;font-weight:bold;";
    this._coinCountSpan.textContent = "0";

    this._coinBadge.appendChild(coinImg);
    this._coinBadge.appendChild(this._coinCountSpan);
    (document.getElementById("root") ?? document.body).appendChild(this._coinBadge);

    // --- Speed boost timer (DOM overlay, below coin badge) ---
    this._boostBadge = document.createElement("div");
    this._boostBadge.style.cssText =
      "position:fixed;top:120px;right:12px;display:flex;align-items:center;gap:6px;" +
      "background:rgba(0,0,0,0.6);padding:5px 10px;border-radius:8px;" +
      "border:1px solid rgba(100,180,255,0.6);z-index:10;pointer-events:none;display:none;";

    const potionImg = document.createElement("img");
    potionImg.src = "/assets/items/blue_potion.png";
    potionImg.style.cssText = "width:24px;height:24px;image-rendering:pixelated;";

    this._boostTimerSpan = document.createElement("span");
    this._boostTimerSpan.style.cssText =
      "color:#64b4ff;font-size:14px;font-family:monospace;font-weight:bold;";
    this._boostTimerSpan.textContent = "0s";

    this._boostBadge.appendChild(potionImg);
    this._boostBadge.appendChild(this._boostTimerSpan);
    (document.getElementById("root") ?? document.body).appendChild(this._boostBadge);

    // --- Mobile controls ---
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
      // Set text first so Phaser computes its height
      this.dialogueText.setText(text).setVisible(true);
      if (this._isTouchDevice) {
        // Mobile: box grows upward dynamically to fit text + choices
        this._redrawDialogueBox(this.dialogueText.height, choices.length);
      } else {
        // PC: fixed position and height
        this._choicesStartY = this.boxY + CHOICES_Y_OFFSET;
        this.dialogueBg.clear()
          .fillStyle(0x0a0a0a, 0.88)
          .fillRoundedRect(this.boxX, this.boxY, this.boxW, DIALOGUE_BOX_HEIGHT, 6)
          .lineStyle(2, 0xffffff, 1)
          .strokeRoundedRect(this.boxX, this.boxY, this.boxW, DIALOGUE_BOX_HEIGHT, 6);
        this.dialogueHint.setPosition(
          this.boxX + this.boxW - DIALOGUE_BOX_PADDING,
          this.boxY + DIALOGUE_BOX_HEIGHT - DIALOGUE_BOX_PADDING
        );
      }
      this.dialogueBg.setVisible(true);
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
      open_github:   "https://github.com/OneAirOne",
    };
    const onAction = (action: string) => {
      this._pendingUrl = ACTION_URLS[action] ?? null;
    };
    const onUrlPending = (url: string) => { this._pendingUrl = url; };
    const onPoiActionEnter = () => { this._inPoiZone = true;  this._syncMobileButtons(); };
    const onPoiActionLeave = () => { this._inPoiZone = false; this._syncMobileButtons(); };

    const onZoneEnter = () => {
      this._inZone = true;
      // On mobile the interact button replaces the text hint
      if (!this._isTouchDevice) {
        this._showHint("Appuyer sur Entrée pour parler");
      }
      this._syncMobileButtons();
    };
    const onZoneLeave = () => {
      this._inZone = false;
      this._hideHint();
      this._syncMobileButtons();
    };

    const onPoiEnter = (text: string) => {
      this._showHint(text);
    };
    const onPoiLeave = () => {
      this._hideHint();
    };

    const onSlimeKilled = () => {
      this._killCount++;
      this._killCountSpan.textContent = String(this._killCount);
    };

    const onCoinCollected = (total: number) => {
      this._coinCountSpan.textContent = String(total);
    };

    const onGameOver = () => {
      this._killCount = 0;
      this._killCountSpan.textContent = "0";
    };

    const onSpeedBoostStart = () => {
      this._boostRemaining = POTION_CONFIG.EFFECT_DURATION;
      this._boostBadge.style.display = "flex";
    };

    const onSpeedBoostEnd = () => {
      this._boostRemaining = 0;
      this._boostBadge.style.display = "none";
    };

    phaserEvents.on(PhaserEvent.DIALOGUE_ZONE_ENTER, onZoneEnter);
    phaserEvents.on(PhaserEvent.DIALOGUE_ZONE_LEAVE, onZoneLeave);
    phaserEvents.on(PhaserEvent.POI_ENTER, onPoiEnter);
    phaserEvents.on(PhaserEvent.POI_LEAVE, onPoiLeave);
    phaserEvents.on(PhaserEvent.POI_ACTION_ENTER, onPoiActionEnter);
    phaserEvents.on(PhaserEvent.POI_ACTION_LEAVE, onPoiActionLeave);
    phaserEvents.on(PhaserEvent.URL_PENDING, onUrlPending);
    phaserEvents.on(PhaserEvent.DIALOGUE_OPEN, renderDialogue);
    phaserEvents.on(PhaserEvent.DIALOGUE_UPDATE, renderDialogue);
    phaserEvents.on(PhaserEvent.DIALOGUE_NAVIGATE, onNavigate);
    phaserEvents.on(PhaserEvent.DIALOGUE_CLOSE, onClose);
    phaserEvents.on(PhaserEvent.DIALOGUE_ACTION, onAction);
    phaserEvents.on(PhaserEvent.SLIME_KILLED, onSlimeKilled);
    phaserEvents.on(PhaserEvent.COIN_COLLECTED, onCoinCollected);
    phaserEvents.on(PhaserEvent.GAME_OVER, onGameOver);
    phaserEvents.on(PhaserEvent.SPEED_BOOST_START, onSpeedBoostStart);
    phaserEvents.on(PhaserEvent.SPEED_BOOST_END, onSpeedBoostEnd);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      phaserEvents.off(PhaserEvent.DIALOGUE_ZONE_ENTER, onZoneEnter);
      phaserEvents.off(PhaserEvent.DIALOGUE_ZONE_LEAVE, onZoneLeave);
      phaserEvents.off(PhaserEvent.POI_ENTER, onPoiEnter);
      phaserEvents.off(PhaserEvent.POI_LEAVE, onPoiLeave);
      phaserEvents.off(PhaserEvent.POI_ACTION_ENTER, onPoiActionEnter);
      phaserEvents.off(PhaserEvent.POI_ACTION_LEAVE, onPoiActionLeave);
      phaserEvents.off(PhaserEvent.URL_PENDING, onUrlPending);
      phaserEvents.off(PhaserEvent.DIALOGUE_OPEN, renderDialogue);
      phaserEvents.off(PhaserEvent.DIALOGUE_UPDATE, renderDialogue);
      phaserEvents.off(PhaserEvent.DIALOGUE_NAVIGATE, onNavigate);
      phaserEvents.off(PhaserEvent.DIALOGUE_CLOSE, onClose);
      phaserEvents.off(PhaserEvent.DIALOGUE_ACTION, onAction);
      phaserEvents.off(PhaserEvent.SLIME_KILLED, onSlimeKilled);
      phaserEvents.off(PhaserEvent.COIN_COLLECTED, onCoinCollected);
      phaserEvents.off(PhaserEvent.GAME_OVER, onGameOver);
      phaserEvents.off(PhaserEvent.SPEED_BOOST_START, onSpeedBoostStart);
      phaserEvents.off(PhaserEvent.SPEED_BOOST_END, onSpeedBoostEnd);
      this._killBadge?.remove();
      this._coinBadge?.remove();
      this._boostBadge?.remove();
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

    // Dialogue buttons – placed in the bottom button row (same Y as attack/interact)
    // Layout: [↓ cycle — left]    [✓ confirm] [✕ close — right]
    const diagBtnY = H - BTN_Y_FROM_BOTTOM - sb;
    const btnR = BTN_RADIUS - 4; // 28px radius → 56px diameter
    this._btnCycle   = this._makeButton(60,      diagBtnY, btnR, "↓", 0x445566);
    this._btnConfirm = this._makeButton(W - 70,  diagBtnY, btnR, "✓", 0x336644);
    this._btnClose   = this._makeButton(W - 150, diagBtnY, btnR, "✕", 0x664433);
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
      const nearConfirm  = Math.hypot(cx - this._btnConfirm.x,  cy - this._btnConfirm.y)  <= btnR;
      const nearInteract = Math.hypot(cx - this._btnInteract.x, cy - this._btnInteract.y) <= btnR;
      if (nearConfirm || nearInteract) {
        window.open(this._pendingUrl, "_blank", "noopener,noreferrer");
        this._pendingUrl = null;
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

  private _redrawHintBg() {
    const b = this.zoneHint.getBounds();
    this.zoneHintBg.clear()
      .fillStyle(0x0a0a0a, 0.88).fillRoundedRect(b.x, b.y, b.width, b.height, 6)
      .lineStyle(2, 0xffffff, 1).strokeRoundedRect(b.x, b.y, b.width, b.height, 6);
  }

  private _showHint(text: string) {
    const W = this.scale.width;
    this.zoneHint.setWordWrapWidth(W - DIALOGUE_BOX_MARGIN * 4);
    this.zoneHint.setText(text);
    // Make visible before reading bounds so Phaser returns up-to-date dimensions
    this.zoneHint.setVisible(true);
    this.zoneHintBg.setVisible(true);
    this._redrawHintBg();
  }

  private _hideHint() {
    this.zoneHintBg.setVisible(false);
    this.zoneHint.setVisible(false);
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
    const inZone       = this._inZone || this._inPoiZone;
    const hasChoices   = this._hasChoices;

    // Joystick + attack hidden during dialogue (movement blocked anyway)
    this._joyBase.setVisible(!dialogueOpen);
    this._joyThumb.setVisible(!dialogueOpen);
    this._btnAttack.setVisible(!dialogueOpen);
    (this._btnAttack.getData("zone") as Phaser.GameObjects.Zone).setVisible(!dialogueOpen);

    // Interact button visible when in zone (dialogue or POI action)
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

  /** Recalculate boxY and redraw the dialogue background to fit text + choices. */
  private _redrawDialogueBox(textH: number, choiceCount: number) {
    const choicesH = choiceCount > 0 ? CHOICES_GAP + choiceCount * CHOICE_LINE_HEIGHT : 0;
    const boxH = Math.max(
      DIALOGUE_BOX_MIN_HEIGHT,
      DIALOGUE_BOX_PADDING + textH + choicesH + DIALOGUE_BOX_PADDING
    );
    this.boxY = this._boxBottom - boxH;
    this._choicesStartY = this.boxY + DIALOGUE_BOX_PADDING + textH + CHOICES_GAP;

    // Reposition text (top of box)
    this.dialogueText.setPosition(
      this.boxX + DIALOGUE_BOX_PADDING,
      this.boxY + DIALOGUE_BOX_PADDING
    );
    // Reposition hint (bottom-right of box)
    this.dialogueHint.setPosition(
      this.boxX + this.boxW - DIALOGUE_BOX_PADDING,
      this.boxY + boxH - DIALOGUE_BOX_PADDING
    );
    // Redraw background
    this.dialogueBg.clear()
      .fillStyle(0x0a0a0a, 0.88)
      .fillRoundedRect(this.boxX, this.boxY, this.boxW, boxH, 6)
      .lineStyle(2, 0xffffff, 1)
      .strokeRoundedRect(this.boxX, this.boxY, this.boxW, boxH, 6);
  }

  update(_time: number, delta: number) {
    if (this._boostRemaining > 0) {
      this._boostRemaining = Math.max(0, this._boostRemaining - delta);
      const secs = Math.ceil(this._boostRemaining / 1000);
      this._boostTimerSpan.textContent = `${secs}s`;
      if (this._boostRemaining === 0) {
        this._boostBadge.style.display = "none";
      }
    }
  }

  private _renderChoices(choices: { label: string }[], selectedIndex: number) {
    this._clearChoices();
    choices.forEach((choice, i) => {
      const isSelected = i === selectedIndex;
      const t = this.add
        .text(
          this.boxX + DIALOGUE_BOX_PADDING,
          this._choicesStartY + i * CHOICE_LINE_HEIGHT,
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
