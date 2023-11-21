import { BootScene, BackgroundScene, SceneLevel1 } from 'scenes';

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '012622',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  fps: {
    target: 60,
    forceSetTimeOut: true, // Use setTimeout if requestAnimationFrame is not available
  },
  scene: [BootScene, BackgroundScene, SceneLevel1],
};

export enum SpriteData {
  SERVER_X = 'serverX',
  SERVER_Y = 'serverY',
  SERVER_ANIM = 'serverAnim',
}

const gameConfig = {
  MAP: {
    NAME: 'tiles_dungeon',
    FILE: 'tiles_dungeon',
    TILESET_PATH: `assets/map/tiles_dungeon.png`,
    TILEMAP_PATH: `assets/map/map.json`,
  },
  CHARACTERS: {
    NAME: 'characters',
    SPRITE_SHEET_ATLAS_PATH: `assets/characters/characters.json`,
    SPRITE_SHEET_TEXTURE_PATH: `assets/characters/characters.png`,
  },
  BACKGROUND: {
    BACKDROP: {
      NAME: 'backdrop',
      PATH: `assets/background/backdrop.png`,
    },
    CLOUD: {
      NAME: 'cloud',
      SPRITE_SHEET_ATLAS_PATH: `assets/background/cloud.json`,
      SPRITE_SHEET_TEXTURE_PATH: `assets/background/cloud.png`,
    },
  },
};

export default gameConfig;
