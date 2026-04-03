import { Schema, MapSchema, type } from "@colyseus/schema";
import { v4 as uuidv4 } from "uuid";

import { SHARED_CONFIG } from "../../../../shared/shared.config";

import {
  Characters,
  type EnemyTextures,
  type LauchOptions,
} from "../../../../shared/types";

import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { Arrow } from "./Arrow";
import { Coin } from "./Coin";

export class GameState extends Schema {
  @type("number") worldWidth = SHARED_CONFIG.WORLD_WIDTH;
  @type("number") worldHeight = SHARED_CONFIG.WORLD_HEIGHT;

  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Enemy }) enemies = new MapSchema<Enemy>();
  @type({ map: Arrow }) arrows = new MapSchema<Arrow>();
  @type({ map: Coin }) coins = new MapSchema<Coin>();

  createPlayer(sessionId: string, lauchOptions: LauchOptions) {
    const newPlayer = new Player();
    newPlayer.name = lauchOptions.name;
    newPlayer.texture = lauchOptions.texture = lauchOptions.texture;
    this.players.set(sessionId, newPlayer);

    return newPlayer;
  }

  createArrow(id: string, x: number, y: number, direction: string, ownerId: string) {
    const arrow = new Arrow();
    arrow.id = id;
    arrow.x = x;
    arrow.y = y;
    arrow.direction = direction;
    arrow.ownerId = ownerId;
    this.arrows.set(id, arrow);
    return arrow;
  }

  createCoin(id: string, x: number, y: number) {
    const coin = new Coin();
    coin.id = id;
    coin.x = x;
    coin.y = y;
    this.coins.set(id, coin);
    return coin;
  }

  createEnemy(texture: EnemyTextures, position: { x: number; y: number }) {
    const newEnemy = new Enemy();
    newEnemy.id = uuidv4();
    newEnemy.texture = texture;
    newEnemy.x = position.x;
    newEnemy.y = position.y;
    this.enemies.set(newEnemy.id, newEnemy);

    return newEnemy;
  }
}
