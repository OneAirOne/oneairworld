import { MapSchema } from "@colyseus/schema";

import { IPlayer, IEnemy } from "./characters";

export interface IGameState {
  players: MapSchema<IPlayer>;
  enemies: MapSchema<IEnemy>;
}
