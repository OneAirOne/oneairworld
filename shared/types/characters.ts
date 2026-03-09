export enum Characters {
  ONEAIR = "oneair",
  LINK = "link",
  FLUPPY = "fluppy",
  SLIME = "slime",
}

export type EnemyTextures = Characters.FLUPPY | Characters.SLIME;

export enum Anim {
  ATTACK_LEFT = "LeftAttack",
  ATTACK_RIGHT = "RightAttack",
  ATTACK_UP = "UpAttack",
  ATTACK_DOWN = "DownAttack",
  LEFT = "Left",
  RIGHT = "Right",
  UP = "Up",
  DOWN = "Down",
  IDDLE_LEFT = "IdleLeft",
  IDDLE_RIGHT = "IdleRight",
  IDDLE_UP = "IdleUp",
  IDDLE_DOWN = "IdleDown",
  HIT_UP = "UpHit",
  HIT_DOWN = "DownHit",
  HIT_LEFT = "LeftHit",
  HIT_RIGHT = "RightHit",
  DEAD = "Dead",
}

export enum DIRECTION {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

export interface IPlayer {
  name: string;
  x: number;
  y: number;
  anim: string;
  texture: Characters;
  direction: DIRECTION;
  isAttacking: boolean;
  life: number;
  isDead: boolean;
  isCollided: boolean;
  collisionDirection: DIRECTION;

  inputQueue: any[];

  decreaseLife: (damage?: number) => void;
}

export interface IEnemy {
  id: string;
  x: number;
  y: number;
  anim: string;
  texture: Characters;
  direction: DIRECTION;
  isAttacking: boolean;
  life: number;
  isDead: boolean;
  isCollided: boolean;
  collisionDirection: DIRECTION;

  decreaseLife: () => void;
}

export const PLAYER_VELOCITY = 2;
export const ENEMY_VELOCITY = 0.8;
