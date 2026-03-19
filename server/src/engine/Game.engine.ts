import Matter from "matter-js";

import { GameState } from "../rooms/schema";
import { processPlayerAction, collisionPlayers, collisionPlayerEnemy, processEnemyAI } from "./actions";

import { SwordMan, createZone, Fluppy, PLAYER_CONFIG, ArrowBody } from "./bodies";
import { COLLISION_CATEGORY } from "./engine.config";
import { SERVER_CONFIG } from "../server.config";

import {
  Characters,
  EnemyTextures,
  InputPayload,
  LauchOptions,
  Zone,
  ZONE_LIST,
} from "../../../shared/types";
import { createRectangle, getSpawnPoints, getTiledInfos } from "./bodies";
import { SHARED_CONFIG, COMBAT_CONFIG, ARROW_CONFIG } from "../../../shared/shared.config";
import { DIRECTION } from "../../../shared/types";

interface ZoneContext {
  engine: Matter.Engine;
  world:  Matter.World;
  spawnPoints: { x: number; y: number }[];
  start:       { x: number; y: number };
}

/**
 * All physics are opered on the game engine 2d MatterJs
 *
 * credits: https://www.imini.app/docs/tutorial-multiple-player/server-combine
 */

export class GameEngine {
  private zoneContexts: Map<Zone, ZoneContext> = new Map();
  private state: GameState = null;
  private maxPlayerSize = 7;
  private players: Record<string, SwordMan> = {};
  private enemies: Record<string, Fluppy> = {};
  private arrows: Record<string, ArrowBody> = {};
  private _arrowsToRemove: string[] = [];
  private _logTimer: number = 0;
  private _savedZonePositions: Record<string, { x: number; y: number }> = {};

  private get roadCtx(): ZoneContext { return this.zoneContexts.get(Zone.ROAD)!; }

  constructor(gameState: GameState) {
    this.state = gameState;
    this.setup();
  }

  private setupCollisionEvents(engine: Matter.Engine) {
    /**
     * COLLISION START — player hitbox hits enemy hurtbox (once per contact)
     */
    Matter.Events.on(engine, "collisionStart", (event) => {
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

      // Pass 1b: arrow→enemy hits
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;
        const isArrowHittingEnemy =
          (bodyA.collisionFilter.category === COLLISION_CATEGORY.ARROW_HIT_BOX &&
            bodyB.collisionFilter.category === COLLISION_CATEGORY.HURT_BOX) ||
          (bodyB.collisionFilter.category === COLLISION_CATEGORY.ARROW_HIT_BOX &&
            bodyA.collisionFilter.category === COLLISION_CATEGORY.HURT_BOX);

        if (isArrowHittingEnemy && bodyA.label !== bodyB.label) {
          const arrowBody  = bodyA.collisionFilter.category === COLLISION_CATEGORY.ARROW_HIT_BOX ? bodyA : bodyB;
          const hurtBody   = bodyA.collisionFilter.category === COLLISION_CATEGORY.HURT_BOX      ? bodyA : bodyB;
          const arrow      = this.arrows[arrowBody.label];
          const enemyState = this.state.enemies.get(hurtBody.label);
          const enemy      = this.enemies[hurtBody.label];

          if (arrow && enemy && enemyState && !enemyState.isDead) {
            enemyState.decreaseLife(COMBAT_CONFIG.ENEMY_HIT_DAMAGE);
            enemy.hitAnimTimer = 600;
            this._arrowsToRemove.push(arrow.id);

            // Knockback in the arrow's travel direction
            const v = ARROW_CONFIG.KNOCKBACK_VELOCITY;
            const dir = arrow.direction;
            const vel =
              dir === DIRECTION.UP    ? { x: 0, y: -v } :
              dir === DIRECTION.DOWN  ? { x: 0, y:  v } :
              dir === DIRECTION.LEFT  ? { x: -v, y: 0 } :
                                        { x:  v, y: 0 };
            Matter.Body.setVelocity(enemy.getBody(), vel);
            enemy.knockbackTimer = ARROW_CONFIG.KNOCKBACK_DURATION;
          }
        }
      }

      // Pass 1c: arrow→wall — stop the arrow
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;
        const isArrowHittingWall =
          (bodyA.collisionFilter.category === COLLISION_CATEGORY.ARROW_HIT_BOX &&
            bodyB.collisionFilter.category === COLLISION_CATEGORY.WALL) ||
          (bodyB.collisionFilter.category === COLLISION_CATEGORY.ARROW_HIT_BOX &&
            bodyA.collisionFilter.category === COLLISION_CATEGORY.WALL);

        if (isArrowHittingWall) {
          const arrowBody = bodyA.collisionFilter.category === COLLISION_CATEGORY.ARROW_HIT_BOX ? bodyA : bodyB;
          const arrow = this.arrows[arrowBody.label];
          if (arrow) this._arrowsToRemove.push(arrow.id);
        }
      }

      // Pass 1d: arrow→player — damage + stop the arrow
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;
        const isArrowHittingPlayer =
          (bodyA.collisionFilter.category === COLLISION_CATEGORY.ARROW_HIT_BOX &&
            bodyB.collisionFilter.category === COLLISION_CATEGORY.PLAYER_HURT_BOX) ||
          (bodyB.collisionFilter.category === COLLISION_CATEGORY.ARROW_HIT_BOX &&
            bodyA.collisionFilter.category === COLLISION_CATEGORY.PLAYER_HURT_BOX);

        if (isArrowHittingPlayer && bodyA.label !== bodyB.label) {
          const arrowBody  = bodyA.collisionFilter.category === COLLISION_CATEGORY.ARROW_HIT_BOX ? bodyA : bodyB;
          const playerBody = bodyA.collisionFilter.category === COLLISION_CATEGORY.PLAYER_HURT_BOX ? bodyA : bodyB;
          const arrow       = this.arrows[arrowBody.label];
          const playerState = this.state.players.get(playerBody.label);

          // Don't hit the archer who fired the arrow
          if (arrow && playerState && !playerState.isDead && playerBody.label !== arrow.ownerId) {
            if (!playerState.isSpeaking) playerState.decreaseLife();
            this._arrowsToRemove.push(arrow.id);
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
    Matter.Events.on(engine, "collisionActive", (event) => {
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
    Matter.Events.on(engine, "collisionEnd", (_event) => {
      if (SERVER_CONFIG.debug) {
        console.log("Collision end ");
      }
    });
  }

  /**
   * Create one Matter engine+world per zone and populate collision bodies.
   */
  setup() {
    for (const zone of ZONE_LIST) {
      const engine = Matter.Engine.create();
      const world  = engine.world;
      engine.gravity.y = 0;

      createZone(zone, world);

      // Camera bounds (only road needs them for physics)
      if (zone === Zone.ROAD) {
        createRectangle(world, 0, 0, SHARED_CONFIG.CAMERA_MAX_WIDTH, SHARED_CONFIG.CAMERA_MAX_HEIGHT);
      }

      this.zoneContexts.set(zone, {
        engine,
        world,
        spawnPoints: getSpawnPoints(zone),
        start:       getTiledInfos(zone).start,
      });

      this.setupCollisionEvents(engine);
    }
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
   * Sync physics positions to Colyseus state (called each update tick).
   */
  private syncPositions() {
    for (const key in this.players) {
      const playerState = this.state.players.get(key);
      if (!playerState || !this.players[key]) continue;
      playerState.x = this.players[key].getBody().position.x;
      playerState.y = this.players[key].getBody().position.y;
    }
    for (const key in this.enemies) {
      const enemyState = this.state.enemies.get(key);
      if (!enemyState || !this.enemies[key]) continue;
      enemyState.x = this.enemies[key].getBody().position.x;
      enemyState.y = this.enemies[key].getBody().position.y;
    }
    for (const key in this.arrows) {
      const arrowState = this.state.arrows.get(key);
      if (!arrowState || !this.arrows[key]) continue;
      arrowState.x = this.arrows[key].getBody().position.x;
      arrowState.y = this.arrows[key].getBody().position.y;
    }
  }

  private getRandomSpawnPosition(zone: Zone = Zone.ROAD) {
    const pts = this.zoneContexts.get(zone)?.spawnPoints ?? [];
    if (pts.length === 0) {
      console.warn(`[GameEngine] No spawn points for zone "${zone}", spawning at origin`);
      return { x: 0, y: 0 };
    }
    return pts[Math.floor(Math.random() * pts.length)];
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

    // Link archer: spawn arrow in the player's current zone
    if (player.arrowRequested) {
      player.arrowRequested = false;
      const zoneCtx = this.zoneContexts.get(playerState.zone as Zone) ?? this.roadCtx;
      const arrowId = `arrow_${sessionId}_${Date.now()}`;
      const arrowBody = new ArrowBody(
        arrowId,
        sessionId,
        zoneCtx.world,
        playerState.x,
        playerState.y,
        playerState.direction as any
      );
      this.arrows[arrowId] = arrowBody;
      this.state.createArrow(arrowId, playerState.x, playerState.y, playerState.direction, sessionId);
    }
  }

  /**
   * Create a player with the session id
   * TODO: use lauchOptions to choose the player
   */
  addPlayer(sessionId: string, lauchOptions: LauchOptions) {
    const { world, engine, start } = this.roadCtx;
    const playerState = this.state.createPlayer(sessionId, lauchOptions);

    // Set spawn position before Colyseus broadcasts the first patch
    // so the client never sees x=0, y=0 and avoids the lerp-from-origin glitch.
    playerState.x = start.x;
    playerState.y = start.y;

    const player = new SwordMan(sessionId, world, engine, playerState, start.x, start.y);
    this.players[sessionId] = player;

    if (SERVER_CONFIG.debug) {
      console.log(`[on join] Bodies in road world: ${world.bodies.length}`);
    }
  }

  /**
   * Create a player with the session id
   * TODO: use lauchOptions to choose the player
   */
  private addEnemy(texture: EnemyTextures) {
    const position = this.getRandomSpawnPosition(Zone.ROAD);
    const enemyState = this.state.createEnemy(texture, position);
    const { world, engine } = this.roadCtx;
    const enemy = new Fluppy(enemyState.id, world, engine, enemyState, position);
    this.enemies[enemyState.id] = enemy;
  }

  setPlayerZone(sessionId: string, zone: string) {
    const player = this.players[sessionId];
    const playerState = this.state.players.get(sessionId);
    if (!player || !playerState) return;

    // Save road position only when leaving road (so we can restore it on return)
    if (playerState.zone === Zone.ROAD) {
      this._savedZonePositions[sessionId] = { x: playerState.x, y: playerState.y };
    }
    player.detachFromWorld();

    const targetZone = zone as Zone;
    const ctx = this.zoneContexts.get(targetZone);
    if (!ctx) return;

    if (targetZone === Zone.ROAD) {
      const saved = this._savedZonePositions[sessionId] ?? ctx.start;
      player.attachToWorld(ctx.world, saved.x, saved.y);
      playerState.x = saved.x;
      playerState.y = saved.y;
      delete this._savedZonePositions[sessionId];
    } else {
      player.attachToWorld(ctx.world, ctx.start.x, ctx.start.y);
      playerState.x = ctx.start.x;
      playerState.y = ctx.start.y;
    }

    playerState.zone = targetZone;
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
    delete this._savedZonePositions[sessionId];

    if (this.state.players.has(sessionId)) {
      this.state.players.delete(sessionId);
    }
    delete this.players[sessionId];
    if (SERVER_CONFIG.debug) {
      console.log(`[on left] Bodies in road world: ${this.roadCtx.world.bodies.length}`);
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
    this.zoneContexts.forEach(({ engine }) => Matter.Engine.update(engine, deltaTime));
    this.syncPositions();

    // TODO: create a dedicated system for logging
    // Log entity counts every 5 seconds
    this._logTimer += deltaTime;
    if (this._logTimer >= 5000) {
      this._logTimer = 0;
      const playerCount = Object.keys(this.players).length;
      const enemyCount  = Object.keys(this.enemies).length;
      const arrowCount  = Object.keys(this.arrows).length;
      console.log(`[Engine] players=${playerCount} enemies=${enemyCount} arrows=${arrowCount}`);
    }

    // Player respawn at the start of their current zone
    this.state.players.forEach((playerState, id) => {
      if (!playerState.isDead) return;
      const playerBody = this.players[id];
      const ctx = this.zoneContexts.get(playerState.zone as Zone) ?? this.roadCtx;
      const start = ctx.start;
      if (playerBody) Matter.Body.setPosition(playerBody.getBody(), start);
      playerState.x = start.x;
      playerState.y = start.y;
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

    // Decrement archer cooldowns
    for (const id in this.players) {
      const p = this.players[id];
      if (p.arrowCooldown > 0) p.arrowCooldown -= deltaTime;
    }

    // Tick arrows — collect expired ones
    for (const id in this.arrows) {
      const expired = this.arrows[id].tick(deltaTime);
      if (expired) this._arrowsToRemove.push(id);
    }

    // Remove arrows (from collision or max distance)
    const toRemove = [...new Set(this._arrowsToRemove)];
    this._arrowsToRemove = [];
    for (const id of toRemove) {
      this.arrows[id]?.remove();
      delete this.arrows[id];
      if (this.state.arrows.has(id)) this.state.arrows.delete(id);
    }

    for (const id in this.enemies) {
      const enemy = this.enemies[id];
      const enemyState = this.state.enemies.get(id);
      if (!enemy || !enemyState || enemyState.isDead) continue;
      processEnemyAI(enemy, enemyState, deltaTime, this.state);
    }
  }
}
