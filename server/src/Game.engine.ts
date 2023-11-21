import Matter from "matter-js";

import { GameState } from "./rooms/schema";
import { sharedConfig } from "../../shared/config";
import {
  Anim,
  InputPayload,
  LauchOptions,
  PLAYER_VELOCITY,
} from "../../shared/types";
import { processPlayerAction } from "../../shared/characters";
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
  private players: Record<string, Matter.Body> = {};

  constructor(gameState: GameState) {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;

    this.state = gameState;

    this.engine.gravity.y = 0;
    this.setup();
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

        this.state.players.get(key).x = this.players[key].position.x;
        this.state.players.get(key).y = this.players[key].position.y;
      }
    });
  }

  processAction(sessionId: string, input: InputPayload, delta: number) {
    const player = this.players[sessionId];
    const playerState = this.state.players.get(sessionId);

    if (!player || !playerState) return;

    processPlayerAction(
      Matter,
      player,
      input,
      delta,
      (anim) => (playerState.anim = anim)
    );
    this.debug();
  }

  addPlayer(sessionId: string, lauchOptions: LauchOptions) {
    const player = Matter.Bodies.rectangle(
      sharedConfig.WORLD_WIDTH / 2,
      sharedConfig.WORLD_HEIGHT / 2,
      sharedConfig.SPRITE_SIZE,
      sharedConfig.SPRITE_SIZE
    );
    this.players[sessionId] = player;
    Matter.Composite.add(this.world, [player]);

    this.state.createPlayer(sessionId, lauchOptions);
  }

  update(deltaTime: number): void {
    Matter.Engine.update(this.engine, deltaTime);
  }

  private createWall() {
    let walls = [
      // Top wall
      Matter.Bodies.rectangle(0, 0, sharedConfig.WORLD_WIDTH, 20, {
        isStatic: true,
      }),
      // Bottom wall
      Matter.Bodies.rectangle(
        sharedConfig.WORLD_HEIGHT,
        sharedConfig.WORLD_HEIGHT,
        sharedConfig.WORLD_WIDTH,
        sharedConfig.SPRITE_SIZE,
        { isStatic: true }
      ),
      // Right wall
      Matter.Bodies.rectangle(
        sharedConfig.WORLD_WIDTH,
        sharedConfig.WORLD_WIDTH,
        sharedConfig.WORLD_HEIGHT,
        sharedConfig.WORLD_WALL_SIZE,
        { isStatic: true }
      ),
      // Left wall
      Matter.Bodies.rectangle(
        sharedConfig.WORLD_HEIGHT,
        sharedConfig.WORLD_HEIGHT,
        sharedConfig.WORLD_WIDTH,
        sharedConfig.WORLD_WALL_SIZE,
        {
          isStatic: true,
        }
      ),
    ];

    Matter.Composite.add(this.world, walls);
  }
}
