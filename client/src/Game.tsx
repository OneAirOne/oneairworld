import Phaser from "phaser";
import { phaserConfig } from "./game.config";

const phaserGame = new Phaser.Game(phaserConfig);

(window as any).game = phaserGame;

export default phaserGame;
