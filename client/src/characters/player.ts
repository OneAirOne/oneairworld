import Phaser from "phaser";
import { Physics } from "phaser";

import { SpriteData } from "game.config";

import { sharedConfig } from "../../../shared/config";
import { Anim, InputPayload, PLAYER_VELOCITY } from "../../../shared/types";
import { processPlayerAction } from "../../../shared/characters/player";

const INTERPOLATION_PERCENT = 0.2;

export class Player extends Phaser.Physics.Matter.Sprite {
  playerId: string;
  playerTexture: string;
  lastAnim: Anim = Anim.IDDLE_DOWN;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    super(scene.matter.world, x, y, texture, frame);
    // Add sprite to the display list
    // Credits : https://github.com/photonstorm/phaser/issues/4255#issuecomment-586084493
    this.scene.add.existing(this);
    this.playerId = id;
    this.playerTexture = texture;
    this.anims.play(`${this.playerTexture}${Anim.IDDLE_DOWN}`, true);
    this.setBounce(0);
    this.setBody(
      {
        type: "rectangle",
        width: sharedConfig.SPRITE_SIZE,
        height: sharedConfig.SPRITE_SIZE,
      },
      {
        restitution: 0,
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
      }
    );
  }

  protected getBody(): MatterJS.Body {
    return this.body as MatterJS.Body;
  }

  processAction(input: InputPayload, delta: number) {
    console.log("in");

    processPlayerAction(this.body, input, delta, (anim) =>
      this.updateAnim(anim)
    );
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
    this.anims.play(`${this.playerTexture}${value}`, true);
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
  update(
    field: string,
    value: number | string | boolean,
    deltaTime?: number
  ): void {
    let vx = 0;
    let vy = 0;

    switch (field) {
      // Used form my player
      case Anim.LEFT:
        if (deltaTime) {
        }
        break;
      case Anim.RIGHT:
        if (deltaTime) {
          vx = PLAYER_VELOCITY * deltaTime;
          vy = 0;
          this.updateAnim(Anim.RIGHT);
        }
        break;
      case Anim.UP:
        if (deltaTime) {
          vx = 0;
          vy = -(PLAYER_VELOCITY * deltaTime);
          this.updateAnim(Anim.UP);
        }
        break;
      case Anim.DOWN:
        if (deltaTime) {
          vx = 0;
          vy = PLAYER_VELOCITY * deltaTime;
          this.updateAnim(Anim.DOWN);
        }
        break;

      // Used for other players and player debugging with remoteRef
      case "x":
        if (typeof value === "number") {
          console.log("X");

          this.setData(SpriteData.SERVER_X, value);
          // @ts-ignore
          this.scene.remoteRef.x = value;
        }
        break;
      case "y":
        if (typeof value === "number") {
          this.setData(SpriteData.SERVER_Y, value);
          // @ts-ignore
          this.scene.remoteRef.y = value;
        }
        break;
      case "anim":
        if (typeof value === "string") {
          this.setData(SpriteData.SERVER_ANIM, value);
        }
        break;
    }
    // this.setVelocity(vx, vy);
  }
}
