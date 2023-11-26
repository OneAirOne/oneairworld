import Phaser from "phaser";

import { SpriteData } from "game.config";

import { sharedConfig } from "../../../shared/config";
import { Anim, InputPayload } from "../../../shared/types";
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

    // Physic settings
    this.setBody({
      type: "rectangle",
      width: sharedConfig.SPRITE_SIZE,
      height: sharedConfig.SPRITE_SIZE,
    });
    // this.setFriction(0.05);
    // this.setFrictionAir(0.0005);
    // this.setBounce(0.9);
    // this.setMass(5);
  }

  protected getBody(): MatterJS.Body {
    return this.body as MatterJS.Body;
  }

  processAction(input: InputPayload, delta: number) {
    processPlayerAction(this.scene.matter, this.body, input, (anim) =>
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
