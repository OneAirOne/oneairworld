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
  HIT_BOX_SIZE: 12,
  HIT_BOX_OFFSET: 15,
  // Enemy damage-receiving hurtbox (centered on body)
  HURT_BOX_SIZE: 10,
  // Damage dealt to enemy per hit
  ENEMY_HIT_DAMAGE: 25,
};

export const ENEMY_CONFIG = {
  // Radius (px) within which an enemy detects and follows a player
  AGGRO_RADIUS: 80,
};
