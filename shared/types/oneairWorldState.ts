import { Schema, MapSchema } from "@colyseus/schema";

export interface Player extends Schema {
  name: string;
  x: number;
  y: number;
  anim: string;
  readyToConnect: boolean;
}

export interface OneairWorldState extends Schema {
  players: MapSchema<Player>;
}
