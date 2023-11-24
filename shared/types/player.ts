import { Schema } from "@colyseus/schema";

export enum Characters {
  ONEAIR = "oneair",
  LINK = "link",
}

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
}

export interface IPlayer extends Schema {
  name: string;
  x: number;
  y: number;
  anim: string;
  texture: Characters;

  inputQueue: any[];
}

export const PLAYER_VELOCITY = 2;
