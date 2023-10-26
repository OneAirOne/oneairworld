import { Schema } from "@colyseus/schema";

export enum Characters {
  ONEAIR = "oneair",
  LINK = "link",
}
export interface IPlayer extends Schema {
  name: string;
  x: number;
  y: number;
  anim: string;
  texture: Characters;
}

export const PLAYER_VELOCITY = 2;
