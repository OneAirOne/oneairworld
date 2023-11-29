import { Schema, MapSchema, type } from "@colyseus/schema";

import { SHARED_CONFIG } from "../../../../shared/shared.config";

import type {
  IGameState,
  IPlayer,
  LauchOptions,
} from "../../../../shared/types";

import { Player } from "./Player";

export class GameState extends Schema implements IGameState {
  @type("number") worldWidth = SHARED_CONFIG.WORLD_WIDTH;
  @type("number") worldHeight = SHARED_CONFIG.WORLD_HEIGHT;

  @type({ map: Player }) players = new MapSchema<Player>();

  createPlayer(sessionId: string, lauchOptions: LauchOptions) {
    const newPlayer = new Player();
    newPlayer.name = lauchOptions.name;
    newPlayer.texture = lauchOptions.texture = lauchOptions.texture;
    this.players.set(sessionId, newPlayer);

    return newPlayer;
  }
}
