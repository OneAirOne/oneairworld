import Phaser from "phaser";

import { SERVER_DATA } from "game.config";

import { Anim, InputPayload } from "../../../shared/types";
import { onairAnimsConfig } from "characters";

/* -------------------------------- Constant -------------------------------- */

const INTERPOLATION_PERCENT = 0.2;
const ANIM_SUFFIX_ATTACK = "Attack";

/* ---------------------------------- Class --------------------------------- */

export class Player extends Phaser.GameObjects.Sprite {
  private _playerTexture: string;
  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private _animKeys: string[] = [];
  private _canUpdateAnim: boolean = true;
  private _inputPayload: InputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
  };
  id: string;
  lastAnim: Anim = Anim.IDDLE_DOWN;
  life: number = 100;
  isCollided: boolean = false;

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
    this._playerTexture = texture;
    this._cursors = this.scene.input.keyboard.createCursorKeys();

    this._animKeys = Object.keys(onairAnimsConfig).map(
      (key) => onairAnimsConfig[key].key
    );
    const isAttackAnim = (anim: Phaser.Animations.Animation) => {
      return this._animKeys
        .filter((key) => key.endsWith(ANIM_SUFFIX_ATTACK))
        .includes(anim?.key || "");
    };

    // Block anims when attack animation START
    this.on(
      Phaser.Animations.Events.ANIMATION_START,
      (anim: Phaser.Animations.Animation) => {
        if (isAttackAnim(anim)) {
          console.log({});

          this._canUpdateAnim = false;
        }
      }
    );

    // Release anims when attack animation COMPLETE
    this.on(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (anim: Phaser.Animations.Animation) => {
        if (isAttackAnim(anim)) {
          this._canUpdateAnim = true;
        }
      }
    );
  }

  /**
   * Synx player input payload with phaser cursors
   */
  handleInput(): InputPayload {
    this._inputPayload.left = this._cursors.left.isDown;
    this._inputPayload.right = this._cursors.right.isDown;
    this._inputPayload.up = this._cursors.up.isDown;
    this._inputPayload.down = this._cursors.down.isDown;
    this._inputPayload.space = this._cursors.space.isDown;

    return this._inputPayload;
  }

  updateLife(newLife: number) {
    this.life = newLife;
  }

  updateIsCollided(isCollided: boolean) {
    this.isCollided = isCollided;
  }

  /**
   * Fonction called by the update loop of the scene
   * to update the position X
   */
  lerpPositionX(x: number) {
    this.x = Phaser.Math.Linear(this.x, x, INTERPOLATION_PERCENT);
  }

  /**
   * Fonction called by the update loop of the scene
   * to update the position Y
   */
  lerpPositionY(y: number) {
    this.y = Phaser.Math.Linear(this.y, y, INTERPOLATION_PERCENT);
  }

  /**
   * Update sprite animation according to the direction
   */
  updateAnim(value: Anim) {
    if (this._canUpdateAnim) {
      this.play(`${this._playerTexture}${value}`, true);
    }

    this.lastAnim = value;
  }

  /**
   * Update player
   *
   * Interpolation method is applied :
   *
   * Colyseus sends state updates to the client at every 50ms (20fps)
   * Client-side re-renders at every 16.6ms (60fps).
   *
   * Key-value are stored with "setData" and sync later in the scene loop
   *
   * Credits: https://learn.colyseus.io/phaser/2-linear-interpolation.html
   */
  update(field: string, value: number | string | boolean): void {
    switch (field) {
      case SERVER_DATA.X:
        if (typeof value === "number") {
          this.setData(SERVER_DATA.X, value);
        }
        break;
      case SERVER_DATA.Y:
        if (typeof value === "number") {
          this.setData(SERVER_DATA.Y, value);
        }
        break;
      case SERVER_DATA.ANIM:
        if (typeof value === "string") {
          this.setData(SERVER_DATA.ANIM, value);
        }
      case SERVER_DATA.LIFE:
        if (typeof value === "number") {
          this.setData(SERVER_DATA.LIFE, value);
        }
      case SERVER_DATA.IS_COLLIDED:
        if (typeof value === "number") {
          this.setData(SERVER_DATA.IS_COLLIDED, value);
        }
        break;
    }
  }
}
