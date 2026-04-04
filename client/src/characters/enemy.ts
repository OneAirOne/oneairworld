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
  private _isDead: boolean = false;
  private _prepTween: Phaser.Tweens.Tween | null = null;
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
    if (!this.scene.anims.exists(key)) return;
    this.play(key, true);
  }

  playDeathAnim() {
    const key = `${this._enemyTexture}${Anim.DEAD}`;
    if (!this.scene.anims.exists(key)) return;
    this._isDead = true;
    this._canUpdateAnim = false;
    this.play(key, false);
  }

  get isDead() {
    return this._isDead;
  }

  update(field: string, value: number | string | boolean): void {
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
      case SERVER_DATA.IS_DEAD:
        if (value === true) this.playDeathAnim();
        break;
      case SERVER_DATA.IS_PREPARING:
        if (value === true) this._startPrepBlink();
        else this._stopPrepBlink();
        break;
    }
  }

  private _startPrepBlink() {
    if (this._prepTween) return;
    this._prepTween = this.scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.25 },
      duration: 120,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private _stopPrepBlink() {
    if (!this._prepTween) return;
    this._prepTween.stop();
    this._prepTween = null;
    this.setAlpha(1);
  }
}
