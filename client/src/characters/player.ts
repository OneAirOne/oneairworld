import Phaser from "phaser";
import { Physics } from "phaser";

import gameConfig, { SpriteData } from "game.config";

const SIZE = 12;

export class Player extends Phaser.Physics.Matter.Sprite {
  playerId: string;
  playerTexture: string;

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
  }

  protected getBody(): MatterJS.BodyType {
    return this.body as MatterJS.BodyType;
  }

  /**
   * Fonction called by the update loop of the scene
   * to update the position X
   */
  updatePositionX(x: number) {
    // this.x = Phaser.Math.Linear(
    //   this.x,
    //   x,
    //   gameConfig.INTERPOLATION_PERCENT
    // );
    // this.setX(x);
  }

  /**
   * Fonction called by the update loop of the scene
   * to update the position Y
   */
  updatePositionY(y: number) {
    // this.y = Phaser.Math.Linear(
    //   this.y,
    //   y,
    //   gameConfig.INTERPOLATION_PERCENT
    // );
    // this.setY(y);
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
