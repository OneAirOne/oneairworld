import Phaser from "phaser";

import { SERVER_DATA } from "client.config";

import { Anim, InputPayload } from "../../../shared/types";
import { anims } from "characters";
import { getBubblePosition, createSpeakingBubble } from "../scenes/game.helpers";

/* -------------------------------- Constant -------------------------------- */

const INTERPOLATION_PERCENT = 0.2;
const ANIM_SUFFIX_ATTACK = "Attack";
const ANIM_SUFFIX_HIT = "Hit";

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
  private _speakingBubble: Phaser.GameObjects.Text | null = null;
  private _bubbleOffsetX = 10;
  private _bubbleOffsetY = 18;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string
  ) {
    super(scene, x, y, texture);

    this.scene.add.existing(this);
    this.scene as Phaser.Scene;
    this.id = id;
    this._playerTexture = texture;
    if (this.scene) {
      this._cursors = this.scene!.input!.keyboard!.createCursorKeys();
    } else {
      throw new Error("Scene is not initialized");
    }

    this._animKeys = Object.keys(anims.animOneAir).map(
      (key) => anims.animOneAir[key].key
    );
    const isAttackAnim = (anim: Phaser.Animations.Animation) => {
      return this._animKeys
        .filter((key) => key.endsWith(ANIM_SUFFIX_ATTACK))
        .includes(anim?.key || "");
    };
    const isHitAnim = (anim: Phaser.Animations.Animation) => {
      return this._animKeys
        .filter((key) => key.endsWith(ANIM_SUFFIX_HIT))
        .includes(anim?.key || "");
    };

    // Block anims when attack animation START
    this.on(
      Phaser.Animations.Events.ANIMATION_START,
      (anim: Phaser.Animations.Animation) => {
        if (isAttackAnim(anim)) {
          this._canUpdateAnim = false;
        }

        if (isHitAnim(anim)) {
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
        if (isHitAnim(anim)) {
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
    if (newLife < this.life) {
      this._playHitAnim();
      this._flashOnHit();
      this._shakeCamera();
    }
    this.life = newLife;
  }

  private _playHitAnim() {
    const directionToHit: Partial<Record<Anim, Anim>> = {
      [Anim.UP]: Anim.HIT_UP, [Anim.IDDLE_UP]: Anim.HIT_UP, [Anim.ATTACK_UP]: Anim.HIT_UP,
      [Anim.DOWN]: Anim.HIT_DOWN, [Anim.IDDLE_DOWN]: Anim.HIT_DOWN, [Anim.ATTACK_DOWN]: Anim.HIT_DOWN,
      [Anim.LEFT]: Anim.HIT_LEFT, [Anim.IDDLE_LEFT]: Anim.HIT_LEFT, [Anim.ATTACK_LEFT]: Anim.HIT_LEFT,
      [Anim.RIGHT]: Anim.HIT_RIGHT, [Anim.IDDLE_RIGHT]: Anim.HIT_RIGHT, [Anim.ATTACK_RIGHT]: Anim.HIT_RIGHT,
    };
    const hitAnim = directionToHit[this.lastAnim] ?? Anim.HIT_DOWN;
    this._canUpdateAnim = false;
    this.play(`${this._playerTexture}${hitAnim}`, true);
  }

  private _flashOnHit() {
    let flashes = 0;
    const maxFlashes = 5;
    const timer = this.scene.time.addEvent({
      delay: 60,
      repeat: maxFlashes * 2 - 1,
      callback: () => {
        flashes++;
        if (flashes % 2 === 1) {
          this.setTint(0xffffff);
        } else {
          this.clearTint();
        }
        if (flashes >= maxFlashes * 2) {
          this.clearTint();
          timer.remove();
        }
      },
    });
  }

  private _shakeCamera() {
    this.scene.cameras.main.shake(150, 0.0008);
  }

  updateIsCollided(isCollided: boolean) {
    this.isCollided = isCollided;
  }

  showSpeakingBubble() {
    if (!this._speakingBubble) {
      this._speakingBubble = createSpeakingBubble(this.scene, this, this._bubbleOffsetX, this._bubbleOffsetY);
      this.scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this._updateBubblePos, this);
    }
    this._speakingBubble.setVisible(true);
  }

  hideSpeakingBubble() {
    this._speakingBubble?.setVisible(false);
  }

  private _updateBubblePos() {
    if (this._speakingBubble?.visible) {
      const pos = getBubblePosition(this, this._bubbleOffsetX, this._bubbleOffsetY);
      this._speakingBubble.setPosition(pos.x, pos.y);
    }
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
      case SERVER_DATA.IS_ATTACKING:
        this.setData(SERVER_DATA.IS_ATTACKING, value);
        break;
      case SERVER_DATA.IS_SPEAKING:
        if (value) {
          this.showSpeakingBubble();
        } else {
          this.hideSpeakingBubble();
        }
        break;
    }
  }
}
