export enum Characters {
  ONEAIR = "oneair",
  TIMOTHEE = "timothee",
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
  isSpeaking: boolean;
  isCollided: boolean;
  collisionDirection: DIRECTION;
  zone: string;
  coins: number;

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
  isPreparing: boolean;
  isAttacking: boolean;
  life: number;
  isDead: boolean;
  isCollided: boolean;
  collisionDirection: DIRECTION;

  decreaseLife: () => void;
}

export interface ICoin {
  id: string;
  x: number;
  y: number;
}

export interface IArrow {
  id: string;
  x: number;
  y: number;
  direction: string;
  ownerId: string;
}

export const PLAYER_VELOCITY = 2;
export const ENEMY_VELOCITY = 0.8;
