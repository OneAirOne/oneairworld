import { Schema, MapSchema, type } from "@colyseus/schema";

import { sharedConfig } from "../../../../shared/config";

import type { IGameState, IPlayer } from "../../../../shared/types";

import { Player } from "./Player";

export class GameState extends Schema implements IGameState {
  @type("number") worldWidth = sharedConfig.WORLD_WIDTH;
  @type("number") worldHeight = sharedConfig.WORLD_HEIGHT;

  @type({ map: Player }) players = new MapSchema<Player>();
}
