// @ts-ignore
import PhaserAnimatedTiles from "phaser-animated-tiles/src/plugin/main";

import { BootScene, BackgroundScene, GameScene, UIScene } from "scenes";

export const PHASER_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "012622",
  pixelArt: true,
  width: window.innerWidth,
  height: window.innerWidth,
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE, // Place the player on center of screen with camera startFollow
  },
  // https://phaser.discourse.group/t/how-to-show-tilemap-animated-tiles-in-phaser-game/9972
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
  scene: [BootScene, BackgroundScene, GameScene, UIScene],
};

export enum SERVER_DATA {
  X = "x",
  Y = "y",
  ANIM = "anim",
  LIFE = "life",
  IS_COLLIDED = "isCollided",
}

const CLIENT_CONFIG = {
  DEBUG: true,
  MAP: {
    TILEMAP: {
      NAME: "map",
      PAHT: `assets/map/map.json`,
    },
    TILESETS: {
      CITY_JAP: {
        NAME: "city-jap",
        PATH: "assets/map/city-jap.png",
      },
      MODERN_CITY: {
        NAME: "city-modern",
        PATH: "assets/map/city-modern.png",
      },
      ARCADE: {
        NAME: "arcade",
        PATH: "assets/map/arcade.png",
      },
    },
  },
  CHARACTERS: {
    NAME: "characters",
    SPRITE_SHEET_ATLAS_PATH: `assets/characters/characters.json`,
    SPRITE_SHEET_TEXTURE_PATH: `assets/characters/characters.png`,
  },
  ITEMS: {
    HEART: {
      NAME: "heart",
      PATH: "assets/items/heart.png",
    },
    HEART_FILLED: {
      NAME: "heart-filled",
      PATH: "assets/items/heart-filled.png",
    },
  },
  BACKGROUND: {
    BACKDROP: {
      NAME: "backdrop",
      PATH: `assets/background/backdrop.png`,
    },
    CLOUD: {
      NAME: "cloud",
      SPRITE_SHEET_ATLAS_PATH: `assets/background/cloud.json`,
      SPRITE_SHEET_TEXTURE_PATH: `assets/background/cloud.png`,
    },
  },
};

export default CLIENT_CONFIG;
