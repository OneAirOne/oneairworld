import Matter from "matter-js";

import { GameState } from "../rooms/schema";
import { processPlayerAction, collisionPlayers } from "./actions";

import { SwordMan, createMap, Fluppy } from "./bodies";
import { COLLISION_CATEGORY } from "./engine.config";
import { SERVER_CONFIG } from "../server.config";

import {
  Characters,
  EnemyTextures,
  InputPayload,
  LauchOptions,
} from "../../../shared/types";
import { createRectangle } from "./bodies";
import { SHARED_CONFIG } from "../../../shared/shared.config";

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

  constructor(gameState: GameState) {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.state = gameState;

    this.setup();

    /**
     * COLLISION ACTIVE LISTENER
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

        if (
          bodyA.label !== bodyB.label &&
          !isWallCollission &&
          !isHitBoxCollition
        ) {
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
    });
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
  addEnemy(texture: EnemyTextures) {
    const enemyState = this.state.createEnemy(texture);

    const enemy = new Fluppy(
      enemyState.id,
      this.world,
      this.engine,
      enemyState
    );

    this.enemies[enemy.id] = enemy;
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

  update(deltaTime: number): void {
    Matter.Engine.update(this.engine, deltaTime);
  }
}
