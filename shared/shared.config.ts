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
