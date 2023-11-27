import Matter from "matter-js";

import { GameState } from "../rooms/schema";
import { sharedConfig } from "../../../shared/config";
import { DIRECTION, InputPayload, LauchOptions } from "../../../shared/types";
import { processPlayerAction } from "../helpers";

import { SwordMan } from "../characters";
import { COLLISION_CATEGORY } from "./config";
/**
 * All physics are opered on the game engine 2d MatterJs
 *
 * credits: https://www.imini.app/docs/tutorial-multiple-player/server-combine
 */

const WALL_CONFIG = {
  isStatic: true,
  collisionFilter: {
    category: COLLISION_CATEGORY.WALL,
  },
};

const PLAYER_CONFIG = {
  collisionFilter: {
    category: COLLISION_CATEGORY.PLAYER,
  },
};

export class GameEngine {
  private world: Matter.World = null;
  private state: GameState = null;
  private engine: Matter.Engine = null;
  private maxPlayerSize = 7;
  private players: Record<string, SwordMan> = {};

  constructor(gameState: GameState) {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;

    this.state = gameState;

    this.engine.gravity.y = 0;
    this.setup();

    // Set up collision events
    Matter.Events.on(this.engine, "collisionActive", (event) => {
      const pairs = event.pairs;

      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        const isNotWallColission =
          bodyA.collisionFilter.category !== COLLISION_CATEGORY.WALL &&
          bodyB.collisionFilter.category !== COLLISION_CATEGORY.WALL;

        if (bodyA.label !== bodyB.label && isNotWallColission) {
          const playerBodyA = this.players[bodyA.label];
          const playerStateA = this.state.players.get(bodyA.label);
          if (playerStateA) {
            console.log(
              playerBodyA.id,
              playerStateA.direction,
              playerStateA.isAttacking
            );
          }

          const playerBodyB = this.players[bodyB.label];
          const playerStateB = this.state.players.get(bodyB.label);
          if (playerStateA) {
          }
          console.log(
            playerBodyB.id,
            playerStateB.direction,
            playerStateB.isAttacking
          );
        }

        // console.log(
        //   "A ",
        //   bodyA.label,
        //   bodyA.collisionFilter.category,
        //   "B",
        //   bodyB.label,
        //   bodyB.collisionFilter.category
        // );
      }
    });

    Matter.Events.on(this.engine, "collisionEnd", (event) => {
      const pairs = event.pairs;
      console.log("Collision end");
    });
  }

  setup() {
    this.createWall();
    this.setupUpdateEvents();
  }

  getEngine() {
    return this.engine;
  }

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
   * at every update event
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

  addPlayer(sessionId: string, lauchOptions: LauchOptions) {
    const bodyConfig = { ...PLAYER_CONFIG, label: sessionId };

    const player = new SwordMan(sessionId, this.world, this.engine, bodyConfig);

    this.players[sessionId] = player;

    this.state.createPlayer(sessionId, lauchOptions);
  }

  removePLayer(sessionId: string) {
    if (this.state.players.has(sessionId)) {
      this.state.players.delete(sessionId);
    }
    const player = this.players[sessionId];
    player.removePlayer();
  }

  update(deltaTime: number): void {
    Matter.Engine.update(this.engine, deltaTime);
  }

  private createWall() {
    const walls = [
      // Top wall
      Matter.Bodies.rectangle(
        sharedConfig.WORLD_WIDTH / 2,
        0,
        sharedConfig.WORLD_WIDTH,
        sharedConfig.WORLD_WALL_SIZE,
        {
          ...WALL_CONFIG,
          label: "wall-top",
        }
      ),
      // Bottom wall
      Matter.Bodies.rectangle(
        sharedConfig.WORLD_WIDTH / 2,
        sharedConfig.WORLD_HEIGHT,
        sharedConfig.WORLD_WIDTH,
        sharedConfig.WORLD_WALL_SIZE,
        { ...WALL_CONFIG, label: "wall-bottom" }
      ),
      // Right wall
      Matter.Bodies.rectangle(
        sharedConfig.WORLD_WIDTH,
        sharedConfig.WORLD_HEIGHT / 2,
        sharedConfig.WORLD_WALL_SIZE,
        sharedConfig.WORLD_HEIGHT,
        { ...WALL_CONFIG, label: "wall-right" }
      ),
      // Left wall
      Matter.Bodies.rectangle(
        0,
        sharedConfig.WORLD_HEIGHT / 2,
        sharedConfig.WORLD_WALL_SIZE,
        sharedConfig.WORLD_HEIGHT,
        { ...WALL_CONFIG, label: "wall-left" }
      ),
    ];

    Matter.World.add(this.world, walls);
  }
}
