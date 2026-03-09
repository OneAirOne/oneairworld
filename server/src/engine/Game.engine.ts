import Matter from "matter-js";

import { GameState } from "../rooms/schema";
import { processPlayerAction, collisionPlayers, collisionPlayerEnemy, processEnemyAI } from "./actions";

import { SwordMan, createMap, Fluppy, PLAYER_CONFIG } from "./bodies";
import { COLLISION_CATEGORY } from "./engine.config";
import { SERVER_CONFIG } from "../server.config";

import {
  Characters,
  EnemyTextures,
  InputPayload,
  LauchOptions,
} from "../../../shared/types";
import { createRectangle, getSpawnPoints, getTiledInfos } from "./bodies";
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
  private playerStart: { x: number; y: number } = getTiledInfos()?.start ?? { x: 0, y: 0 };

  constructor(gameState: GameState) {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.state = gameState;

    this.setup();

    /**
     * COLLISION START — player hitbox hits enemy hurtbox (once per contact)
     */
    Matter.Events.on(this.engine, "collisionStart", (event) => {
      // Pass 1: player→enemy hits (apply cancels + knockback first)
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
            const enemyState = this.state.enemies.get(hit.enemyId);
            if (enemy && enemyState) {
              enemy.targetPlayerId = hit.playerId;
              enemy.hitAnimTimer = 600;

              // Cancel ongoing attack — mark damage as dealt to block same-tick enemy→player hit
              if (enemyState.isAttacking && !enemy.attackDamageDealt) {
                enemyState.isAttacking = false;
                enemy.attackTimer = 0;
                enemy.attackDamageDealt = true;
              }

              // Knockback
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

      // Pass 2: enemy→player hits (cancels from pass 1 are already applied)
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;

        const isEnemyHittingPlayer =
          (bodyA.collisionFilter.category === COLLISION_CATEGORY.ENEMY_HIT_BOX &&
            bodyB.collisionFilter.category === COLLISION_CATEGORY.PLAYER_HURT_BOX) ||
          (bodyB.collisionFilter.category === COLLISION_CATEGORY.ENEMY_HIT_BOX &&
            bodyA.collisionFilter.category === COLLISION_CATEGORY.PLAYER_HURT_BOX);

        if (isEnemyHittingPlayer && bodyA.label !== bodyB.label) {
          const enemyBody = bodyA.collisionFilter.category === COLLISION_CATEGORY.ENEMY_HIT_BOX ? bodyA : bodyB;
          const playerBody = bodyA.collisionFilter.category === COLLISION_CATEGORY.PLAYER_HURT_BOX ? bodyA : bodyB;
          const enemy = this.enemies[enemyBody.label];
          const playerState = this.state.players.get(playerBody.label);
          if (enemy && playerState && !enemy.attackDamageDealt && !playerState.isSpeaking) {
            playerState.decreaseLife();
            enemy.attackDamageDealt = true;
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

  setPlayerSpeaking(sessionId: string, isSpeaking: boolean) {
    const player = this.players[sessionId];
    if (!player) return;
    const body = player.getBody();
    Matter.Body.setStatic(body, isSpeaking);
    if (!isSpeaking) {
      // Restore dynamic properties lost when going static
      Matter.Body.setMass(body, PLAYER_CONFIG.mass);
      Matter.Body.setVelocity(body, { x: 0, y: 0 });
    }
  }

  spawnEnemies(count: number) {
    for (let i = 0; i < count; i++) {
      this.addEnemy(Characters.SLIME);
    }
  }

  private onEnemyDeath() {
    this.spawnEnemies(1);
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

    // Player respawn at initial start position
    this.state.players.forEach((playerState, id) => {
      if (!playerState.isDead) return;
      const playerBody = this.players[id];
      if (playerBody) Matter.Body.setPosition(playerBody.getBody(), this.playerStart);
      playerState.x = this.playerStart.x;
      playerState.y = this.playerStart.y;
      playerState.life = 100;
      playerState.isDead = false;
    });

    // Enemy death — delay removal to let death anim play
    const DEATH_ANIM_DURATION = 700;
    const deadEnemyIds: string[] = [];

    this.state.enemies.forEach((enemyState, id) => {
      if (!enemyState.isDead) return;
      const body = this.enemies[id];
      if (!body) return;
      if (body.deathAnimTimer < 0) {
        // First death tick: fling in current direction then let it coast
        const DEATH_FLING = 1.5;
        const dir = enemyState.direction as DIRECTION;
        const vel =
          dir === DIRECTION.UP    ? { x: 0, y: -DEATH_FLING } :
          dir === DIRECTION.DOWN  ? { x: 0, y:  DEATH_FLING } :
          dir === DIRECTION.LEFT  ? { x: -DEATH_FLING, y: 0 } :
                                    { x:  DEATH_FLING, y: 0 };
        Matter.Body.setVelocity(body.getBody(), vel);
        body.deathAnimTimer = DEATH_ANIM_DURATION;
      } else {
        // Decelerate naturally
        const v = body.getBody().velocity;
        Matter.Body.setVelocity(body.getBody(), { x: v.x * 0.88, y: v.y * 0.88 });
        body.deathAnimTimer -= deltaTime;
        if (body.deathAnimTimer <= 0) {
          deadEnemyIds.push(id);
        }
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
