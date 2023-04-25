import Phaser from "phaser";

import gameConfig from "game.config";
import { SCENES } from "./scene.config";

const NB_CLOUDS = 20;

export default class BackgroundScene extends Phaser.Scene {
  private clouds!: Phaser.Physics.Arcade.Group;

  constructor() {
    super(SCENES.BACKGROUND);
  }

  create() {
    const sceneHeight = this.cameras.main.height;
    const sceneWidth = this.cameras.main.width;

    this.cameras.main.setBackgroundColor("#c6eefc");

    // Ad backdrop image
    const backdropImage = this.add.image(
      sceneWidth / 2,
      sceneHeight / 2,
      gameConfig.BACKGROUND.BACKDROP.NAME
    );
    const scale = Math.max(
      sceneWidth / backdropImage.width,
      sceneHeight / backdropImage.height
    );
    backdropImage.setScale(scale).setScrollFactor(0);

    // Add clouds at random positions with random speed
    const frames = this.textures
      .get(gameConfig.BACKGROUND.CLOUD.NAME)
      .getFrameNames();
    this.clouds = this.physics.add.group();

    for (let i = 0; i < NB_CLOUDS; i++) {
      const x = Phaser.Math.RND.between(-sceneWidth * 0.5, sceneWidth * 1.5);
      const y = Phaser.Math.RND.between(sceneHeight * 0.2, sceneHeight * 0.8);
      const velocity = Phaser.Math.RND.between(15, 30);

      this.clouds
        .get(x, y, gameConfig.BACKGROUND.CLOUD.NAME, frames[i % 6])
        .setScale(3)
        .setVelocity(velocity, 0);
    }
  }

  update(time: number, delta: number): void {
    this.physics.world.wrap(this.clouds, 500);
  }
}
