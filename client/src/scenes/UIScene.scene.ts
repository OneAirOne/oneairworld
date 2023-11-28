import Phaser from "phaser";

import { SCENES } from "./scene.config";

export class UIScene extends Phaser.Scene {
  constructor() {
    super(SCENES.UI);
  }

  create() {
    console.log("Running ui scene");
  }
}
