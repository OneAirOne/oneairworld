import Phaser from "phaser";

import { SERVER_DATA } from "client.config";
import { Anim } from "../../../shared/types";

const INTERPOLATION_PERCENT = 0.2;
const HIT_ANIMS = [Anim.HIT_UP, Anim.HIT_DOWN, Anim.HIT_LEFT, Anim.HIT_RIGHT];
const ATTACK_ANIMS = [Anim.ATTACK_UP, Anim.ATTACK_DOWN, Anim.ATTACK_LEFT, Anim.ATTACK_RIGHT];
const BLOCKING_ANIMS = [...HIT_ANIMS, ...ATTACK_ANIMS];

export class Enemy extends Phaser.GameObjects.Sprite {
  private _enemyTexture: string;
  private _canUpdateAnim: boolean = true;
  id: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string
  ) {
    super(scene, x, y, texture);

    this.scene.add.existing(this);
    this.id = id;
    this._enemyTexture = texture;

    // Block anim updates while a hit or attack animation plays
    this.on(Phaser.Animations.Events.ANIMATION_START, (anim: Phaser.Animations.Animation) => {
      if (BLOCKING_ANIMS.some((h) => anim.key === `${this._enemyTexture}${h}`)) {
        this._canUpdateAnim = false;
      }
    });

    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim: Phaser.Animations.Animation) => {
      if (BLOCKING_ANIMS.some((h) => anim.key === `${this._enemyTexture}${h}`)) {
        this._canUpdateAnim = true;
      }
    });
  }

  lerpPositionX(x: number) {
    this.x = Phaser.Math.Linear(this.x, x, INTERPOLATION_PERCENT);
  }

  lerpPositionY(y: number) {
    this.y = Phaser.Math.Linear(this.y, y, INTERPOLATION_PERCENT);
  }

  updateAnim(value: Anim) {
    if (!this._canUpdateAnim) return;
    const key = `${this._enemyTexture}${value}`;
    console.log(`[Enemy] Updating animation: ${key}`);
    
    if (!this.scene.anims.exists(key)) return;
    this.play(key, true);
  }

  update(field: string, value: number | string): void {
    switch (field) {
      case SERVER_DATA.X:
        if (typeof value === "number") this.setData(SERVER_DATA.X, value);
        break;
      case SERVER_DATA.Y:
        if (typeof value === "number") this.setData(SERVER_DATA.Y, value);
        break;
      case SERVER_DATA.ANIM:
        if (typeof value === "string") this.setData(SERVER_DATA.ANIM, value);
        break;
    }
  }
}
