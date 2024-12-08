import { MapSchema, Schema } from "@colyseus/schema";

import { IPlayer } from "./characters";

export interface IGameState extends Schema {
  players: MapSchema<IPlayer>;
}
