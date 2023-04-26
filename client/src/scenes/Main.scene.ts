import Phaser from "phaser";
import Network, { Network as NetworkType } from "services/Network";

export default class MainScene extends Phaser.Scene {
  network!: NetworkType;
}
