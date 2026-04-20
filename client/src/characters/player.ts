import Phaser from "phaser";

import { SERVER_DATA } from "client.config";

import { Anim, Characters, InputPayload } from "../../../shared/types";
import { animOneAir } from "./anims/oneair.anims";
import { animTimothee } from "./anims/timothee.anims";
import { animLink } from "./anims/link.anims";
import { getBubblePosition, createSpeakingBubble } from "../scenes/game.helpers";
import { mobileInput } from "../input/mobileInput";

/* -------------------------------- Constant -------------------------------- */

const INTERPOLATION_PERCENT = 0.2;
const ANIM_SUFFIX_ATTACK = "Attack";
const ANIM_SUFFIX_HIT = "Hit";

function getAnimConfig(texture: string) {
  if (texture === Characters.TIMOTHEE) return animTimothee;
  if (texture === Characters.LINK)     return animLink;
  return animOneAir;
}

/* ---------------------------------- Class --------------------------------- */

export class Player extends Phaser.GameObjects.Sprite {
  private _playerTexture: string;
  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private _animKeys: string[] = [];
  private _canUpdateAnim: boolean = true;
  private _isDying: boolean = false;
  private _sprintKey!: Phaser.Input.Keyboard.Key;
  private _inputPayload: InputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
    sprint: false,
  };
  id: string;
  lastAnim: Anim = Anim.IDDLE_DOWN;

  get characterId(): string {
    return this._playerTexture;
  }
  life: number = 100;
  isCollided: boolean = false;
  private _speakingBubble: Phaser.GameObjects.Text | null = null;
  private _bubbleOffsetX = 10;
  private _bubbleOffsetY = 18;
  private _halo: Phaser.GameObjects.Graphics | null = null;
  private _haloTween: Phaser.Tweens.Tween | null = null;

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

    if (texture === Characters.ONEAIR || texture === Characters.LINK) {
      this.setScale(1.1);
    }

    if (this.scene) {
      // TODO: clean keyboard listeners
      this._cursors = this.scene!.input!.keyboard!.createCursorKeys();
      this._sprintKey = this.scene!.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    } else {
      throw new Error("Scene is not initialized");
    }

    // Build anim key list from the character's own anim config
    this._animKeys = Object.values(getAnimConfig(texture)).map((a) => a.key);

    // Play default idle animation immediately to avoid missing-texture placeholder on first render
    const defaultKey = `${texture}${Anim.IDDLE_DOWN}`;
    if (this.scene.anims.exists(defaultKey)) this.play(defaultKey, true);

    const isAttackAnim = (anim: Phaser.Animations.Animation) =>
      this._animKeys
        .filter((key) => key.endsWith(ANIM_SUFFIX_ATTACK))
        .includes(anim?.key || "");

    const isHitAnim = (anim: Phaser.Animations.Animation) =>
      this._animKeys
        .filter((key) => key.endsWith(ANIM_SUFFIX_HIT))
        .includes(anim?.key || "");

    // Block anim updates while an attack or hit animation plays
    this.on(
      Phaser.Animations.Events.ANIMATION_START,
      (anim: Phaser.Animations.Animation) => {
        if (isAttackAnim(anim) || isHitAnim(anim)) {
          this._canUpdateAnim = false;
        }
      }
    );

    // Unblock when attack / hit animation completes (not for death)
    this.on(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      (anim: Phaser.Animations.Animation) => {
        if (this._isDying) return; // death anim handles its own cleanup
        if (isAttackAnim(anim) || isHitAnim(anim)) {
          this._canUpdateAnim = true;
        }
      }
    );
  }

  /**
   * Synx player input payload with phaser cursors
   */
  handleInput(): InputPayload {
    // Block all input while death animation is playing
    if (this._isDying) {
      return { left: false, right: false, up: false, down: false, space: false, sprint: false };
    }

    const pad = this.scene.input.gamepad?.getPad(0);
    const axisX   = pad?.leftStick.x ?? 0;
    const axisY   = pad?.leftStick.y ?? 0;
    const DEAD    = 0.4; // dead zone

    const gpLeft   = axisX < -DEAD || (pad?.left  ?? false);
    const gpRight  = axisX >  DEAD || (pad?.right ?? false);
    const gpUp     = axisY < -DEAD || (pad?.up    ?? false);
    const gpDown   = axisY >  DEAD || (pad?.down  ?? false);
    const gpAttack = pad?.A ?? false;   // A / Croix → attaque
    const gpSprint = ((pad?.R2 ?? 0) as number) > 0.5 || !!(pad?.R1 ?? false); // R2 ou R1 → sprint

    this._inputPayload.left   = this._cursors.left.isDown  || mobileInput.left  || gpLeft;
    this._inputPayload.right  = this._cursors.right.isDown || mobileInput.right || gpRight;
    this._inputPayload.up     = this._cursors.up.isDown    || mobileInput.up    || gpUp;
    this._inputPayload.down   = this._cursors.down.isDown  || mobileInput.down  || gpDown;
    this._inputPayload.space  = this._cursors.space.isDown || mobileInput.space || gpAttack;
    this._inputPayload.sprint = (this._sprintKey?.isDown ?? false)               || gpSprint;

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

  /**
   * Play the hit animation only if the character has one.
   * (e.g. timothee has no hit anims → skipped gracefully)
   */
  private _playHitAnim() {
    const directionToHit: Partial<Record<Anim, Anim>> = {
      [Anim.UP]: Anim.HIT_UP, [Anim.IDDLE_UP]: Anim.HIT_UP, [Anim.ATTACK_UP]: Anim.HIT_UP,
      [Anim.DOWN]: Anim.HIT_DOWN, [Anim.IDDLE_DOWN]: Anim.HIT_DOWN, [Anim.ATTACK_DOWN]: Anim.HIT_DOWN,
      [Anim.LEFT]: Anim.HIT_LEFT, [Anim.IDDLE_LEFT]: Anim.HIT_LEFT, [Anim.ATTACK_LEFT]: Anim.HIT_LEFT,
      [Anim.RIGHT]: Anim.HIT_RIGHT, [Anim.IDDLE_RIGHT]: Anim.HIT_RIGHT, [Anim.ATTACK_RIGHT]: Anim.HIT_RIGHT,
    };
    const hitAnim = directionToHit[this.lastAnim] ?? Anim.HIT_DOWN;
    const key = `${this._playerTexture}${hitAnim}`;
    if (!this.scene.anims.exists(key)) return; // character has no hit anims
    this._canUpdateAnim = false;
    this.play(key, true);
  }

  /**
   * Play the death animation if the character has one, then unblock.
   * Position lerp and inputs are frozen until the anim completes.
   * (e.g. oneair has no dead anim → skipped gracefully)
   */
  private _playDeathAnim() {
    const key = `${this._playerTexture}${Anim.DEAD}`;
    if (!this.scene.anims.exists(key)) return; // character has no dead anim
    this._isDying = true;
    this._canUpdateAnim = false;
    this.play(key, false);
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this._isDying = false;
      this._canUpdateAnim = true;
    });
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
          this.setTintFill(0xffffff);
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

  private _startHalo() {
    if (this._halo) return;
    this._halo = this.scene.add.graphics();
    this._halo.setDepth(this.depth + 1);
    this._halo.setPosition(this.x, this.y);
    // Concentric circles for a soft glow
    const color = 0xffff88;
    for (const { r, a } of [{ r: 20, a: 0.12 }, { r: 14, a: 0.22 }, { r: 9, a: 0.35 }]) {
      this._halo.fillStyle(color, a);
      this._halo.fillCircle(0, 0, r);
    }
    this._haloTween = this.scene.tweens.add({
      targets: this._halo,
      alpha: { from: 1, to: 0.35 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this._updateHaloPos, this);
  }

  private _stopHalo() {
    if (!this._halo) return;
    this._haloTween?.stop();
    this._haloTween = null;
    this._halo.destroy();
    this._halo = null;
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this._updateHaloPos, this);
  }

  private _updateHaloPos() {
    if (this._halo) this._halo.setPosition(this.x, this.y);
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

  lerpPositionX(x: number) {
    if (this._isDying) return; // freeze position during death anim
    this.x = Phaser.Math.Linear(this.x, x, INTERPOLATION_PERCENT);
  }

  lerpPositionY(y: number) {
    if (this._isDying) return;
    this.y = Phaser.Math.Linear(this.y, y, INTERPOLATION_PERCENT);
  }

  updateAnim(value: Anim) {
    if (this._canUpdateAnim) {
      const key = `${this._playerTexture}${value}`;
      if (this.scene.anims.exists(key)) {
        this.play(key, true);
      }
    }
    this.lastAnim = value;
  }

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
      case SERVER_DATA.IS_DEAD:
        if (value === true) {
          this._playDeathAnim();
          this.setVisible(false);
          this.hideSpeakingBubble();
        } else {
          this.setVisible(true);
        }
        break;
      case SERVER_DATA.IS_SPEAKING:
        if (value) {
          this.showSpeakingBubble();
        } else {
          this.hideSpeakingBubble();
        }
        break;
      case SERVER_DATA.HAS_SPEED_BOOST:
        if (value) this._startHalo();
        else this._stopHalo();
        break;
    }
  }
}
