import Phaser from "phaser";

import { SCENES } from "./scene.config";
import CLIENT_CONFIG from "client.config";

export class UIScene extends Phaser.Scene {
  constructor() {
    super(SCENES.UI);
  }
  preload() {
    const camera = this.cameras.add(
      0,
      0,
      this.sys.canvas.width,
      this.sys.canvas.height
    );
    console.log("this.sys.canvas.width : ", this.sys.canvas.width);
    console.log("this.sys.canvas.height : ", this.sys.canvas.height);
  }

  create() {
    console.log("Running ui scene");
    // this.add.image(20, 20, GAME_CONFIG.ITEMS.HEART_FILLED.NAME);
  }
}
