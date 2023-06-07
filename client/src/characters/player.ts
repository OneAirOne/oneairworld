import Phaser from "phaser";

import gameConfig, { SpriteData } from "game.config";

export class Player extends Phaser.Physics.Arcade.Sprite {
  playerId: string;
  playerTexture: string;
  playerContainer: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);

    this.playerId = id;
    this.playerTexture = texture;
    this.setDepth(this.y);
    scene.add.existing(this);

    this.playerContainer = this.scene.add
      .container(this.x, this.y)
      .setDepth(10000);

    this.playerContainer.add(this);

    this.anims.play(`${this.playerTexture}IdleDown`, true);
  }

  updatePositionX(x: number) {
    console.log("x", x, this.x);
    this.playerContainer.x = Phaser.Math.Linear(
      this.playerContainer.x,
      x,
      gameConfig.INTERPOLATION_PERCENT
    );
  }
  updatePositionY(y: number) {
    console.log("Y", y, this.y);
    this.playerContainer.y = Phaser.Math.Linear(
      this.playerContainer.y,
      y,
      gameConfig.INTERPOLATION_PERCENT
    );
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
    console.log({ field, value });
    switch (field) {
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
          // TODO: setData
          this.setData(SpriteData.SERVER_ANIM);
          this.anims.play(`${this.playerTexture}${value}`, true);
        }
        break;
    }
  }
}
