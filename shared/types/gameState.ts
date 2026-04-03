import { MapSchema } from "@colyseus/schema";

import { IPlayer, IEnemy, IArrow, ICoin } from "./characters";

export interface IGameState {
  players: MapSchema<IPlayer>;
  enemies: MapSchema<IEnemy>;
  arrows: MapSchema<IArrow>;
  coins: MapSchema<ICoin>;
}
