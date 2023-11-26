import Phaser from "phaser";

import { SpriteData } from "game.config";

import { Anim, InputPayload } from "../../../shared/types";
import { onairAnimsConfig } from "characters";

/* -------------------------------- Constant -------------------------------- */

const INTERPOLATION_PERCENT = 0.2;
const ANIM_SUFFIX_ATTACK = "Attack";

/* ---------------------------------- Class --------------------------------- */

export class Player extends Phaser.GameObjects.Sprite {
  private _playerId: string;
  private _playerTexture: string;
  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private _animKeys: string[] = [];

  lastAnim: Anim = Anim.IDDLE_DOWN;
  private canUpdateAnim: boolean = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string
  ) {
    super(scene, x, y, texture);

    this.scene.add.existing(this);
    this._playerId = id;
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
          this.canUpdateAnim = false;
        }
      }
    );

    // Release anims when attack animation COMPLETE
    this.on(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (anim: Phaser.Animations.Animation) => {
        if (isAttackAnim(anim)) {
          this.canUpdateAnim = true;
        }
      }
    );
  }

  // local input
  inputPayload: InputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
  };

  getPlayerId() {
    return this._playerId;
  }

  /**
   * Synx player input payload with phaser cursors
   */
  handleInput(): InputPayload {
    this.inputPayload.left = this._cursors.left.isDown;
    this.inputPayload.right = this._cursors.right.isDown;
    this.inputPayload.up = this._cursors.up.isDown;
    this.inputPayload.down = this._cursors.down.isDown;
    this.inputPayload.space = this._cursors.space.isDown;

    return this.inputPayload;
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
    if (this.canUpdateAnim) {
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
      // Used for other players
      case "x":
        if (typeof value === "number") {
          this.setData(SpriteData.SERVER_X, value);
        }
        break;
      case "y":
        if (typeof value === "number") {
          this.setData(SpriteData.SERVER_Y, value);
        }
        break;
      case "anim":
        if (typeof value === "string") {
          this.setData(SpriteData.SERVER_ANIM, value);
        }
        break;
    }
  }
}
