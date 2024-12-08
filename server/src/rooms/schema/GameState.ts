import { Schema, MapSchema, type } from "@colyseus/schema";
import { v4 as uuidv4 } from "uuid";

import { SHARED_CONFIG } from "../../../../shared/shared.config";

import {
  Characters,
  type EnemyTextures,
  type IGameState,
  type LauchOptions,
} from "../../../../shared/types";

import { Player } from "./Player";
import { Enemy } from "./Enemy";

export class GameState extends Schema implements IGameState {
  @type("number") worldWidth = SHARED_CONFIG.WORLD_WIDTH;
  @type("number") worldHeight = SHARED_CONFIG.WORLD_HEIGHT;

  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Enemy }) enemies = new MapSchema<Enemy>();

  createPlayer(sessionId: string, lauchOptions: LauchOptions) {
    const newPlayer = new Player();
    newPlayer.name = lauchOptions.name;
    newPlayer.texture = lauchOptions.texture = lauchOptions.texture;
    this.players.set(sessionId, newPlayer);

    return newPlayer;
  }

  createEnemy(texture: EnemyTextures) {
    const newEnemy = new Enemy();
    newEnemy.id = uuidv4();
    newEnemy.texture = newEnemy.texture = texture;
    this.enemies.set(newEnemy.id, newEnemy);

    return newEnemy;
  }
}
