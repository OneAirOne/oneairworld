import { Schema, MapSchema, type } from "@colyseus/schema";

import type { IGameState, IPlayer } from "../../../../shared/types";

import { Player } from "./Player";

export class GameState extends Schema implements IGameState {
  @type({ map: Player })
  players = new MapSchema<Player>();
}
