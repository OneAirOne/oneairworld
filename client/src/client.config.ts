import { Characters } from "../../shared/types";

export enum SERVER_DATA {
  X = "x",
  Y = "y",
  ANIM = "anim",
  LIFE = "life",
  IS_COLLIDED = "isCollided",
  IS_ATTACKING = "isAttacking",
  IS_DEAD = "isDead",
  IS_SPEAKING = "isSpeaking",
  ZONE = "zone",
}

const CLIENT_CONFIG = {
  // ── Switch player character here ─────────────────────────────────────────
  // Characters.ONEAIR  → hit anims ✓  dead anim ✗
  // Characters.TIMOTHEE → hit anims ✗  dead anim ✓
  // Characters.LINK    → archer, fires arrows instead of sword
  ACTIVE_PLAYER: Characters.LINK,
  // ─────────────────────────────────────────────────────────────────────────
  DEBUG: false,
  DEBUG_LAYER: 7,
  MAP: {
    TILE_MAP: {
      NAME: "map",
      PAHT: `assets/map/map.json`,
    },
    TILE_SETS: {
      LOGOS: {
        NAME: "logos",
        PATH: "assets/map/logos.png",
      },
      MODERN_CITY: {
        NAME: "city-modern",
        PATH: "assets/map/city-modern.png",
      },
      CITY_JAP: {
        NAME: "city-jap",
        PATH: "assets/map/city-jap.png",
      },
      INTERIOR_JAP: {
        NAME: "interior-jap",
        PATH: "assets/map/interior-jap.png",
      },
      RURAL_JAP: {
        NAME: "rural-jap",
        PATH: "assets/map/rural-jap.png",
      },
      ARCADE: {
        NAME: "arcade",
        PATH: "assets/map/arcade.png",
      },
      OSAKA: {
        NAME: "osaka",
        PATH: "assets/map/osaka.png",
      },
      TEST: {
        NAME: "test",
        PATH: "assets/map/test.png",
      },
    },
  },
  CHARACTERS: {
    NAME: "characters",
    SPRITE_SHEET_ATLAS_PATH: `assets/characters/characters.json`,
    SPRITE_SHEET_TEXTURE_PATH: `assets/characters/characters.png`,
    SLIME: {
      NAME: "slime",
      SPRITE_SHEET_ATLAS_PATH: `assets/characters/slime.json`,
      SPRITE_SHEET_TEXTURE_PATH: `assets/characters/slime.png`,
    },
    WIZARD: {
      NAME: "wizard",
      SPRITE_SHEET_ATLAS_PATH: `assets/characters/wizard.json`,
      SPRITE_SHEET_TEXTURE_PATH: `assets/characters/wizard.png`,
    },
    ROBOT: {
      NAME: "robot",
      SPRITE_SHEET_ATLAS_PATH: `assets/characters/robot.json`,
      SPRITE_SHEET_TEXTURE_PATH: `assets/characters/robot.png`,
    },
    DINO: {
      NAME: "dino",
      SPRITE_SHEET_ATLAS_PATH: `assets/characters/dino.json`,
      SPRITE_SHEET_TEXTURE_PATH: `assets/characters/dino.png`,
    },
    TIMOTHEE: {
      NAME: "timothee",
      SPRITE_SHEET_ATLAS_PATH: `assets/characters/timothee.json`,
      SPRITE_SHEET_TEXTURE_PATH: `assets/characters/timothee.png`,
    },
    GHOST: {
      NAME: "ghost",
      SPRITE_SHEET_ATLAS_PATH: `assets/characters/ghost.json`,
      SPRITE_SHEET_TEXTURE_PATH: `assets/characters/ghost.png`,
    },
    WENDY: {
      NAME: "wendy",
      SPRITE_SHEET_ATLAS_PATH: `assets/characters/wendy.json`,
      SPRITE_SHEET_TEXTURE_PATH: `assets/characters/wendy.png`,
    },
    JOHN: {
      NAME: "john",
      SPRITE_SHEET_ATLAS_PATH: `assets/characters/john.json`,
      SPRITE_SHEET_TEXTURE_PATH: `assets/characters/john.png`,
    },
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
