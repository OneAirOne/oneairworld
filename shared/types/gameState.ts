import { MapSchema } from "@colyseus/schema";

import { IPlayer, IEnemy, IArrow } from "./characters";

export interface IGameState {
  players: MapSchema<IPlayer>;
  enemies: MapSchema<IEnemy>;
  arrows: MapSchema<IArrow>;
}
