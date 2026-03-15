export enum COLLISION_CATEGORY {
  WALL            = 0x0001,
  PLAYER          = 0x0002,
  ENEMY           = 0x0004,
  HIT_BOX         = 0x0008, // player attack zone
  HURT_BOX        = 0x0010, // enemy damage-receiving zone
  ENEMY_HIT_BOX   = 0x0020, // enemy attack zone
  PLAYER_HURT_BOX = 0x0040, // player damage-receiving zone
  ARROW_HIT_BOX   = 0x0080, // archer arrow projectile
}

export enum COLLISION_GROUP {
  WALL = 0x0001,
  PLAYER = 0x0002,
  HIT_BOX = 0x0003,
}
