import Phaser from "phaser";

import { SCENES } from "./scene.config";
import { phaserEvents, PhaserEvent } from "../events/eventManager";
import type { DialoguePayload, DialogueNavigatePayload } from "../dialogue/DialogueManager";

const DIALOGUE_BOX_HEIGHT = 140;
const DIALOGUE_BOX_MARGIN = 12;
const DIALOGUE_BOX_PADDING = 14;
const CHOICES_Y_OFFSET = 62; // y offset from boxY where choices start
const CHOICE_LINE_HEIGHT = 18;

export class UIScene extends Phaser.Scene {
  private zoneHint!: Phaser.GameObjects.Text;
  private zoneHintBg!: Phaser.GameObjects.Graphics;
  private dialogueBg!: Phaser.GameObjects.Graphics;
  private dialogueText!: Phaser.GameObjects.Text;
  private dialogueHint!: Phaser.GameObjects.Text;
  private choiceTexts: Phaser.GameObjects.Text[] = [];
  private boxY = 0;
  private boxW = 0;

  constructor() {
    super(SCENES.UI);
  }

  preload() {
    this.cameras.add(0, 0, this.sys.canvas.width, this.sys.canvas.height);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.boxY = H - DIALOGUE_BOX_HEIGHT - DIALOGUE_BOX_MARGIN;
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

    // --- Events ---
    const renderDialogue = ({ text, choices }: DialoguePayload) => {
      this.zoneHintBg.setVisible(false);
      this.zoneHint.setVisible(false);
      this.dialogueBg.setVisible(true);
      this.dialogueText.setText(text).setVisible(true);
      this.dialogueHint.setText(choices.length === 0 ? "Fermer ✕" : "Entrée ▶").setVisible(true);
      this._renderChoices(choices, 0);
    };

    const onNavigate = ({ selectedIndex }: DialogueNavigatePayload) => {
      this.choiceTexts.forEach((t, i) => {
        t.setText(`${i === selectedIndex ? "▶ " : "  "}${t.getData("label")}`);
        t.setColor(i === selectedIndex ? "#ffffff" : "#888888");
      });
    };

    const onClose = () => {
      this.dialogueBg.setVisible(false);
      this.dialogueText.setVisible(false);
      this.dialogueHint.setVisible(false);
      this._clearChoices();
    };

    const onZoneEnter = () => { this.zoneHintBg.setVisible(true); this.zoneHint.setVisible(true); };
    const onZoneLeave = () => { this.zoneHintBg.setVisible(false); this.zoneHint.setVisible(false); };

    phaserEvents.on(PhaserEvent.DIALOGUE_ZONE_ENTER, onZoneEnter);
    phaserEvents.on(PhaserEvent.DIALOGUE_ZONE_LEAVE, onZoneLeave);
    phaserEvents.on(PhaserEvent.DIALOGUE_OPEN, renderDialogue);
    phaserEvents.on(PhaserEvent.DIALOGUE_UPDATE, renderDialogue);
    phaserEvents.on(PhaserEvent.DIALOGUE_NAVIGATE, onNavigate);
    phaserEvents.on(PhaserEvent.DIALOGUE_CLOSE, onClose);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      phaserEvents.off(PhaserEvent.DIALOGUE_ZONE_ENTER, onZoneEnter);
      phaserEvents.off(PhaserEvent.DIALOGUE_ZONE_LEAVE, onZoneLeave);
      phaserEvents.off(PhaserEvent.DIALOGUE_OPEN, renderDialogue);
      phaserEvents.off(PhaserEvent.DIALOGUE_UPDATE, renderDialogue);
      phaserEvents.off(PhaserEvent.DIALOGUE_NAVIGATE, onNavigate);
      phaserEvents.off(PhaserEvent.DIALOGUE_CLOSE, onClose);
    });
  }

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
