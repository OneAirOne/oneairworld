import Phaser from "phaser";
import { Physics } from "phaser";

import { SpriteData } from "game.config";

import { sharedConfig } from "../../../shared/config";

const INTERPOLATION_PERCENT = 0.2;

export class Player extends Phaser.Physics.Matter.Sprite {
  playerId: string;
  playerTexture: string;
  velocity: number;

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
    this.anims.play(`${this.playerTexture}IdleDown`, true);
    this.setBounce(1);
    this.setBody({
      type: "rectangle",
      width: sharedConfig.SPRITE_SIZE,
      height: sharedConfig.SPRITE_SIZE,
    });
    this.velocity = 2;
  }

  protected getBody(): MatterJS.BodyType {
    return this.body as MatterJS.BodyType;
  }

  /**
   * Fonction called by the update loop of the scene
   * to update the position X
   */
  updatePositionX(x: number) {
    this.x = Phaser.Math.Linear(this.x, x, INTERPOLATION_PERCENT);
  }

  /**
   * Fonction called by the update loop of the scene
   * to update the position Y
   */
  updatePositionY(y: number) {
    this.y = Phaser.Math.Linear(this.y, y, INTERPOLATION_PERCENT);
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
      // Used form my player
      case "left":
        this.x -= Number(value);
        break;
      case "right":
        this.x += Number(value);
        break;
      case "up":
        this.y -= Number(value);
        break;
      case "down":
        this.y += Number(value);
        break;

      // Used for other players
      case "x":
        if (typeof value === "number") {
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
          // TODO: setData
          this.anims.play(`${this.playerTexture}${value}`, true);
          // this.setData(SpriteData.SERVER_ANIM);
        }
        break;
    }
  }
}
