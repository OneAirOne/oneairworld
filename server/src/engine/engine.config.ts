export enum COLLISION_CATEGORY {
  WALL     = 0x0001,
  PLAYER   = 0x0002,
  ENEMY    = 0x0004,
  HIT_BOX  = 0x0008, // attack zone (moves in front of attacker)
  HURT_BOX = 0x0010, // damage-receiving zone (centered on target)
}

export enum COLLISION_GROUP {
  WALL = 0x0001,
  PLAYER = 0x0002,
  HIT_BOX = 0x0003,
}
