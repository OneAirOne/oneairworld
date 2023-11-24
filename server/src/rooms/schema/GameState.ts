import { Schema, MapSchema, type } from "@colyseus/schema";

import { sharedConfig } from "../../../../shared/config";

import type {
  IGameState,
  IPlayer,
  LauchOptions, // Check if unused
} from "../../../../shared/types";

import { Player } from "./Player";

export class GameState extends Schema implements IGameState {
  @type("number") worldWidth = sharedConfig.WORLD_WIDTH;
  @type("number") worldHeight = sharedConfig.WORLD_HEIGHT;

  @type({ map: Player }) players = new MapSchema<Player>();

  createPlayer(sessionId: string, lauchOptions: LauchOptions) {
    const newPlayer = new Player();
    newPlayer.name = lauchOptions.name;
    newPlayer.texture = lauchOptions.texture = lauchOptions.texture;
    this.players.set(sessionId, newPlayer);
  }
}
