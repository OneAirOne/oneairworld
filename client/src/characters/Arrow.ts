import Phaser from "phaser";
import CLIENT_CONFIG from "client.config";

// Anim keys for each direction (1-frame "anims" created in Game.scene.ts)
export const ARROW_ANIM_KEYS: Record<string, string> = {
  UP:    "arrowUp",
  DOWN:  "arrowDown",
  LEFT:  "arrowLeft",
  RIGHT: "arrowRight",
};

export class Arrow extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: string
  ) {
    super(scene, x, y, CLIENT_CONFIG.CHARACTERS.NAME);
    scene.add.existing(this);
    this.setDepth(1);

    const animKey = ARROW_ANIM_KEYS[direction] ?? ARROW_ANIM_KEYS.DOWN;
    if (scene.anims.exists(animKey)) {
      this.play(animKey);
    }
  }
}
