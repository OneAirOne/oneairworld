import Matter from "matter-js";

import { Enemy as EnemyState } from "../../rooms/schema/Enemy";
import { COLLISION_CATEGORY } from "../engine.config";

import { SHARED_CONFIG } from "../../../../shared/shared.config";
import { DIRECTION } from "../../../../shared/types";
import { getTiledInfos } from "./map/map.body";

const { start } = getTiledInfos();

export interface BodyConfig {
  label: string;
  collisionFilter: Matter.ICollisionFilter;
}

const ENEMY_CONFIG = {
  collisionFilter: {
    category: COLLISION_CATEGORY.ENEMY,
  },
  inertia: 0.2,
  restitution: 0.5,
  friction: 0.8,
  frictionAir: 0,
  frictionStatic: 0,
  density: 10,
  mass: 0.2,
};

const FORCE = 0.002;
const DIRECTION_INTERVAL_MIN = 2000;
const DIRECTION_INTERVAL_MAX = 4000;

export class Enemy {
  protected _world: Matter.World;
  protected _body: Matter.Body;
  protected _engine: Matter.Engine;
  protected _enemyState: EnemyState;
  id: string;
  isAttacking: boolean = false;
  wantsNewDirection: boolean = true;
  targetPlayerId: string | null = null;
  hitAnimTimer: number = 0;
  loseAggroTimer: number = 0;
  deathAnimTimer: number = -1;
  attackTimer: number = 0;
  attackCooldown: number = 0;
  attackDamageDealt: boolean = false;
  attackLungeVx: number = 0;
  attackLungeVy: number = 0;
  knockbackTimer: number = 0;
  private _directionTimer: number = 0;
  private _directionInterval: number =
    DIRECTION_INTERVAL_MIN +
    Math.random() * (DIRECTION_INTERVAL_MAX - DIRECTION_INTERVAL_MIN);

  constructor(
    id: string,
    world: Matter.World,
    engine: Matter.Engine,
    enemyState: EnemyState,
    position?: { x: number; y: number }
  ) {
    this.id = id;
    this._engine = engine;
    this._world = world;
    this._enemyState = enemyState;

    const spawnX = position?.x ?? start.x;
    const spawnY = position?.y ?? start.y;

    this._body = Matter.Bodies.rectangle(
      spawnX,
      spawnY,
      SHARED_CONFIG.SPRITE_SIZE,
      SHARED_CONFIG.SPRITE_SIZE,
      {
        label: id,
        ...ENEMY_CONFIG,
      }
    );

    Matter.World.add(world, [this._body]);

    Matter.Events.on(engine, "collisionStart", (event) => {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;
        const isWall =
          bodyA.collisionFilter.category === COLLISION_CATEGORY.WALL ||
          bodyB.collisionFilter.category === COLLISION_CATEGORY.WALL;
        const isMe = bodyA.label === id || bodyB.label === id;
        if (isWall && isMe) {
          this.wantsNewDirection = true;
        }
      }
    });

    Matter.Events.on(engine, "afterUpdate", () => {
      if (
        this?._enemyState?.collisionDirection === DIRECTION.DOWN &&
        this?._enemyState?.isCollided
      ) {
        Matter.Body.applyForce(this._body, this._body.position, {
          x: 0,
          y: -FORCE,
        });

        if (this?._enemyState?.isCollided) {
          this._enemyState.isCollided = false;
        }
      }
      if (
        this?._enemyState?.collisionDirection === DIRECTION.UP &&
        this?._enemyState?.isCollided
      ) {
        Matter.Body.applyForce(this._body, this._body.position, {
          x: 0,
          y: +FORCE,
        });

        if (this?._enemyState?.isCollided) {
          this._enemyState.isCollided = false;
        }
      }
      if (
        this?._enemyState?.collisionDirection === DIRECTION.LEFT &&
        this?._enemyState?.isCollided
      ) {
        Matter.Body.applyForce(this._body, this._body.position, {
          x: FORCE,
          y: 0,
        });

        if (this?._enemyState?.isCollided) {
          this._enemyState.isCollided = false;
        }
      }
      if (
        this?._enemyState?.collisionDirection === DIRECTION.RIGHT &&
        this?._enemyState?.isCollided
      ) {
        Matter.Body.applyForce(this._body, this._body.position, {
          x: -FORCE,
          y: 0,
        });

        if (this?._enemyState?.isCollided) {
          this._enemyState.isCollided = false;
        }
      }
    });
  }

  tickTimer(deltaTime: number) {
    this._directionTimer += deltaTime;
    if (this._directionTimer >= this._directionInterval) {
      this._directionTimer = 0;
      this._directionInterval =
        DIRECTION_INTERVAL_MIN +
        Math.random() * (DIRECTION_INTERVAL_MAX - DIRECTION_INTERVAL_MIN);
      this.wantsNewDirection = true;
    }
  }

  getBody() {
    return this._body;
  }

  removePlayer() {
    console.log("player remove");
    Matter.World.remove(this._world, [this.getBody()]);
  }
}
