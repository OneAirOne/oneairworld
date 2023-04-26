import { Schema } from "@colyseus/schema";

export interface IPlayer extends Schema {
  name: string;
  x: number;
  y: number;
  anim: string;
}
