// ── Per-character combat / hitbox configuration ───────────────────────────────
// bodyW/H      : physics collision body (walls, other players)
// hurtBoxW/H   : damage-receiving box (centered on body)
// hitBoxSize   : attack box (square sensor in front of player)
export interface CharacterCombatConfig {
  bodyW: number;
  bodyH: number;
  hurtBoxW: number;
  hurtBoxH: number;
  hitBoxSize: number;
  hurtBoxOffsetY: number;  // vertical offset of hurtbox from body center (+ = down toward feet)
  hitBoxOffsetUp: number;
  hitBoxOffsetDown: number;
  hitBoxOffsetLeft: number;
  hitBoxOffsetRight: number;
  hitBoxOffsetLRY: number; // vertical nudge applied to left & right hitbox
}

export const CHARACTER_COMBAT_CONFIG: Record<string, CharacterCombatConfig> = {
  oneair: {
    bodyW: 12,
    bodyH: 12,
    hurtBoxW: 16,
    hurtBoxH: 16,
    hitBoxSize: 16,
    hurtBoxOffsetY: 0,
    hitBoxOffsetUp: 20,
    hitBoxOffsetDown: 20,
    hitBoxOffsetLeft: 20,
    hitBoxOffsetRight: 20,
    hitBoxOffsetLRY: 0,
  },
  timothee: {
    bodyW: 16,
    bodyH: 32,
    hurtBoxW: 16,
    hurtBoxH: 24,
    hitBoxSize: 20,
    hurtBoxOffsetY: 8, // shift toward feet (bodyH/2 - hurtBoxH/2 = 16 - 12 = 4, tune as needed)
    hitBoxOffsetUp: 5,
    hitBoxOffsetDown: 20,
    hitBoxOffsetLeft: 10,
    hitBoxOffsetRight: 10,
    hitBoxOffsetLRY: 8,
  },
};

// Fallback: use oneair values for any unknown character
export function getCharCombatConfig(texture: string): CharacterCombatConfig {
  return CHARACTER_COMBAT_CONFIG[texture] ?? CHARACTER_COMBAT_CONFIG["oneair"];
}

export const SHARED_CONFIG = {
  // Unit = pixel
  SPRITE_SIZE: 12,
  TILE_SIZE: 16,
  WORLD_WIDTH: 1600,
  WORLD_HEIGHT: 1600,
  WORLD_WALL_SIZE: 1,
  CAMERA_MAX_WIDTH: 1000,
  CAMERA_MAX_HEIGHT: 700,
};

export const COMBAT_CONFIG = {
  // Player attack hitbox (sensor in front of player when attacking)
  HIT_BOX_SIZE: 16,
  HIT_BOX_OFFSET: 20,
  // Enemy damage-receiving hurtbox (centered on body)
  HURT_BOX_SIZE: 16,
  // Damage dealt to enemy per hit
  ENEMY_HIT_DAMAGE: 50,
  // Damage dealt to player per enemy hit
  PLAYER_HIT_DAMAGE: 10,
  // Enemy knockback on hit
  ENEMY_KNOCKBACK_VELOCITY: 0.5,
  ENEMY_KNOCKBACK_DURATION: 250,
};

// ── PNJ (Non-Player Characters) configuration ─────────────────────────────────
export interface PnjConfig {
  texture: string;
  spawnPoint: string;
  offsetX: number;
  offsetY: number;
  visible: boolean;
  atlasKey?: string;
  /** If set, player can interact with this PNJ (dialogue key in dialogues.json) */
  dialogueId?: string;
  /** Override dialogueId on non-touch (desktop) devices */
  dialogueIdDesktop?: string;
  /** Bubble offset relative to sprite (defaults to 10, 14) */
  bubbleOffsetX?: number;
  bubbleOffsetY?: number;
}

export const PNJ_LIST: PnjConfig[] = [
  { texture: "ghost",  spawnPoint: "pnj1", offsetX:  0, offsetY: 0, visible: true,  dialogueId: "ghost", dialogueIdDesktop: "ghost_pc", bubbleOffsetX: 10, bubbleOffsetY: 5 },
  { texture: "wizard", spawnPoint: "pnj9", offsetX:   0, offsetY: 0, visible: false },
  { texture: "wendy",  spawnPoint: "pnj2", offsetX:   0, offsetY: 0, visible: true, dialogueId: "wendy", bubbleOffsetX: 10, bubbleOffsetY: 15 },
  { texture: "dino",   spawnPoint: "pnj4", offsetX:   0, offsetY: 0, visible: true, dialogueId: "dino" },
  { texture: "john",   spawnPoint: "pnj7", offsetX:   0, offsetY: 0, visible: true,  dialogueId: "john"  },
  { texture: "robot",  spawnPoint: "pnj3", offsetX:   0, offsetY: 0, visible: true,  dialogueId: "robot"  },
];

export const ARROW_CONFIG = {
  SPEED: 5,                  // px per physics tick (at 60 fps)
  MAX_DISTANCE: 400,         // px before arrow despawns
  FIRE_COOLDOWN: 600,        // ms between shots
  SIZE: 6,                   // hitbox size in px
  KNOCKBACK_VELOCITY: 2.5,   // stronger than sword (0.5)
  KNOCKBACK_DURATION: 350,   // ms
};

export const ENEMY_CONFIG = {
  // Radius (px) within which an enemy detects and follows a player
  AGGRO_RADIUS: 60,
  // Distance (px) at which the enemy starts an attack
  ATTACK_RANGE: 22,
  // Duration (ms) of the attack animation / attack state
  ATTACK_DURATION: 600,
  // Cooldown (ms) before the enemy can attack again
  ATTACK_COOLDOWN: 2000,
};
