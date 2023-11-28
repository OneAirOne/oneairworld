import { BootScene, BackgroundScene, GameScene, UIScene } from "scenes";
import { sharedConfig } from "../../shared/config";

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "012622",
  pixelArt: true,
  width: sharedConfig.WORLD_WIDTH,
  height: sharedConfig.WORLD_HEIGHT,
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
    // zoom: 2,
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

const gameConfig = {
  MAP: {
    NAME: "tiles_dungeon",
    FILE: "tiles_dungeon",
    TILESET_PATH: `assets/map/tiles_dungeon.png`,
    TILEMAP_PATH: `assets/map/map.json`,
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

export default gameConfig;
