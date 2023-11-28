import { MapSchema, Schema } from "@colyseus/schema";

import { Player } from "characters";

export interface IGameState extends Schema {
  players: MapSchema<Player>;
}
