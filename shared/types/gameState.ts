import { MapSchema } from "@colyseus/schema";

import { IPlayer } from "./characters";

export interface IGameState {
  players: MapSchema<IPlayer>;
}
