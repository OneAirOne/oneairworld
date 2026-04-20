// @ts-ignore
import PhaserAnimatedTiles from "phaser-animated-tiles/src/plugin/main";

import { BootScene, BackgroundScene, Road, UIScene, InteriorScene } from "scenes";

export const PHASER_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "000000",
  pixelArt: true,
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
  },
  plugins: {
    scene: [
      {
        key: "animatedTiles",
        plugin: PhaserAnimatedTiles,
        start: true,
        mapping: "animatedTiles",
      },
    ],
  },
  input: {
    gamepad: true,
  },
  scene: [BootScene, BackgroundScene, Road, UIScene, InteriorScene],
};
