import Matter from "matter-js";

import { GameState } from "../rooms/schema";
import { processPlayerAction, collisionPlayers, collisionPlayerEnemy, processEnemyAI } from "./actions";

import { SwordMan, createMap, Fluppy } from "./bodies";
import { COLLISION_CATEGORY } from "./engine.config";
import { SERVER_CONFIG } from "../server.config";

import {
  Characters,
  EnemyTextures,
  InputPayload,
  LauchOptions,
} from "../../../shared/types";
import { createRectangle, getSpawnPoints } from "./bodies";
import { SHARED_CONFIG, COMBAT_CONFIG } from "../../../shared/shared.config";
import { DIRECTION } from "../../../shared/types";

/**
 * All physics are opered on the game engine 2d MatterJs
 *
 * credits: https://www.imini.app/docs/tutorial-multiple-player/server-combine
 */

export class GameEngine {
  private world: Matter.World = null;
  private state: GameState = null;
  private engine: Matter.Engine = null;
  private maxPlayerSize = 7;
  private players: Record<string, SwordMan> = {};
  private enemies: Record<string, Fluppy> = {};
  private spawnPoints: { x: number; y: number }[] = getSpawnPoints();

  constructor(gameState: GameState) {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.state = gameState;

    this.setup();

    /**
     * COLLISION START — player hitbox hits enemy hurtbox (once per contact)
     */
    Matter.Events.on(this.engine, "collisionStart", (event) => {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;

        const isPlayerHittingEnemy =
          (bodyA.collisionFilter.category === COLLISION_CATEGORY.HIT_BOX &&
            bodyB.collisionFilter.category === COLLISION_CATEGORY.HURT_BOX) ||
          (bodyB.collisionFilter.category === COLLISION_CATEGORY.HIT_BOX &&
            bodyA.collisionFilter.category === COLLISION_CATEGORY.HURT_BOX);

        if (isPlayerHittingEnemy && bodyA.label !== bodyB.label) {
          const hit = collisionPlayerEnemy(bodyA, bodyB, this.state);
          if (hit) {
            const enemy = this.enemies[hit.enemyId];
            if (enemy) {
              enemy.targetPlayerId = hit.playerId;
              enemy.hitAnimTimer = 600;

              // Knockback: push enemy in the attack direction
              const playerState = this.state.players.get(hit.playerId);
              if (playerState) {
                const v = COMBAT_CONFIG.ENEMY_KNOCKBACK_VELOCITY;
                const dir = playerState.direction as DIRECTION;
                const vel =
                  dir === DIRECTION.UP    ? { x: 0, y: -v } :
                  dir === DIRECTION.DOWN  ? { x: 0, y:  v } :
                  dir === DIRECTION.LEFT  ? { x: -v, y: 0 } :
                                           { x:  v, y: 0 };
                Matter.Body.setVelocity(enemy.getBody(), vel);
                enemy.knockbackTimer = COMBAT_CONFIG.ENEMY_KNOCKBACK_DURATION;
              }
            }
          }
        }
      }
    });

    /**
     * COLLISION ACTIVE — continuous player-player collisions
     */
    Matter.Events.on(this.engine, "collisionActive", (event) => {
      const pairs = event.pairs;

      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        const isWallCollission =
          bodyA.collisionFilter.category === COLLISION_CATEGORY.WALL &&
          bodyB.collisionFilter.category == COLLISION_CATEGORY.WALL;

        const isHitBoxCollition =
          bodyA.collisionFilter.category === COLLISION_CATEGORY.HIT_BOX &&
          bodyB.collisionFilter.category === COLLISION_CATEGORY.HIT_BOX;

        const isPlayerHittingEnemy =
          (bodyA.collisionFilter.category === COLLISION_CATEGORY.HIT_BOX &&
            bodyB.collisionFilter.category === COLLISION_CATEGORY.HURT_BOX) ||
          (bodyB.collisionFilter.category === COLLISION_CATEGORY.HIT_BOX &&
            bodyA.collisionFilter.category === COLLISION_CATEGORY.HURT_BOX);

        if (bodyA.label !== bodyB.label && !isWallCollission && !isHitBoxCollition && !isPlayerHittingEnemy) {
          collisionPlayers(bodyA, bodyB, this.state);
        }
      }
    });

    /**
     * COLLISION END LISTENER
     */
    Matter.Events.on(this.engine, "collisionEnd", (_event) => {
      if (SERVER_CONFIG.debug) {
        console.log("Collision end ");
      }
    });
  }

  /**
   * Setup game
   */
  setup() {
    createMap(this.world);
    // Add camera bounds
    createRectangle(
      this.world,
      0,
      0,
      SHARED_CONFIG.CAMERA_MAX_WIDTH,
      SHARED_CONFIG.CAMERA_MAX_HEIGHT
    );
    this.engine.gravity.y = 0;
    this.setupUpdateEvents();
  }

  /**
   * Debug engine
   */
  debug() {
    for (const key in this.players) {
      if (!this.state.players.get(key) || !this.players[key]) {
        continue;
      }
      console.log("---------------------");
      console.log(
        `[${key}] x:${this.state.players.get(key).x} y:${
          this.state.players.get(key).y
        }`
      );
    }
  }

  /**
   * Sync physics game engine with colyseus state
   * after every update event
   */
  private setupUpdateEvents() {
    Matter.Events.on(this.engine, "afterUpdate", () => {
      for (const key in this.players) {
        if (!this.state.players.get(key) || !this.players[key]) {
          continue;
        }
        this.state.players.get(key).x = this.players[key].getBody().position.x;
        this.state.players.get(key).y = this.players[key].getBody().position.y;
      }

      for (const key in this.enemies) {
        if (!this.state.enemies.get(key) || !this.enemies[key]) {
          continue;
        }
        this.state.enemies.get(key).x = this.enemies[key].getBody().position.x;
        this.state.enemies.get(key).y = this.enemies[key].getBody().position.y;
      }
    });
  }

  private getRandomSpawnPosition() {
    if (this.spawnPoints.length === 0) {
      console.warn("[GameEngine] No spawn points found in map, spawning at origin");
      return { x: 0, y: 0 };
    }
    return this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
  }

  /**
   * Execute inqueued player inputs
   */
  processAction(sessionId: string, input: InputPayload, delta: number) {
    const player = this.players[sessionId];
    const playerState = this.state.players.get(sessionId);

    if (!player || !playerState) return;

    processPlayerAction(
      player,
      playerState,
      input,
      (anim) => (playerState.anim = anim)
    );
  }

  /**
   * Create a player with the session id
   * TODO: use lauchOptions to choose the player
   */
  addPlayer(sessionId: string, lauchOptions: LauchOptions) {
    const playerState = this.state.createPlayer(sessionId, lauchOptions);

    const player = new SwordMan(
      sessionId,
      this.world,
      this.engine,
      playerState
    );

    this.players[sessionId] = player;
    if (SERVER_CONFIG.debug) {
      const numberOfBodies = this.world.bodies.length;
      console.log(`[on join] Number of bodies in the world: ${numberOfBodies}`);
    }
  }

  /**
   * Create a player with the session id
   * TODO: use lauchOptions to choose the player
   */
  private addEnemy(texture: EnemyTextures) {
    const position = this.getRandomSpawnPosition();
    const enemyState = this.state.createEnemy(texture, position);
    const enemy = new Fluppy(enemyState.id, this.world, this.engine, enemyState, position);
    this.enemies[enemyState.id] = enemy;
  }

  spawnEnemies(count: number) {
    for (let i = 0; i < count; i++) {
      this.addEnemy(Characters.FLUPPY);
    }
  }

  private onEnemyDeath() {
    const bonus = Math.random() < SERVER_CONFIG.enemySpawnChance ? 1 : 0;
    this.spawnEnemies(1 + bonus);
  }

  /**
   * Remove player bodies and player colyseus state
   */
  removePLayer(sessionId: string) {
    const player = this.players[sessionId];
    player.removePlayer();

    if (this.state.players.has(sessionId)) {
      this.state.players.delete(sessionId);
    }
    if (SERVER_CONFIG.debug) {
      const numberOfBodies = this.world.bodies.length;
      console.log(`[on left] Number of bodies in the world: ${numberOfBodies}`);
    }
  }

  /**
   * Remove enemy bodies and colyseus state
   */
  removeEnemy(enemyId: string) {
    const enemy = this.enemies[enemyId];
    if (!enemy) return;

    enemy.removePlayer();

    if (this.state.enemies.has(enemyId)) {
      this.state.enemies.delete(enemyId);
    }

    delete this.enemies[enemyId];
  }

  update(deltaTime: number): void {
    Matter.Engine.update(this.engine, deltaTime);

    const deadEnemyIds: string[] = [];

    this.state.enemies.forEach((enemyState, id) => {
      if (enemyState.isDead) {
        deadEnemyIds.push(id);
      }
    });

    for (const id of deadEnemyIds) {
      this.removeEnemy(id);
      this.onEnemyDeath();
    }

    for (const id in this.enemies) {
      const enemy = this.enemies[id];
      const enemyState = this.state.enemies.get(id);
      if (!enemy || !enemyState || enemyState.isDead) continue;
      processEnemyAI(enemy, enemyState, deltaTime, this.state);
    }
  }
}
