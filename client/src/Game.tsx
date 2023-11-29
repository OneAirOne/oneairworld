import Phaser from "phaser";
import { PHASER_CONFIG } from "./client.config";

const phaserGame = new Phaser.Game(PHASER_CONFIG);

(window as any).game = phaserGame;

export default phaserGame;
