import { MapSchema, Schema } from "@colyseus/schema";

import { IPlayer } from "./player";

export interface IGameState extends Schema {
  players: MapSchema<IPlayer>;
}
