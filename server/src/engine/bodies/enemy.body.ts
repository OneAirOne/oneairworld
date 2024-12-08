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

export class Enemy {
  protected _world: Matter.World;
  protected _body: Matter.Body;
  protected _engine: Matter.Engine;
  protected _enemyState: EnemyState;
  id: string;
  isAttacking: boolean = false;

  constructor(
    id: string,
    world: Matter.World,
    engine: Matter.Engine,
    enemyState: EnemyState
  ) {
    this.id = id;
    this._engine = engine;
    this._world = world;
    this._enemyState = enemyState;

    this._body = Matter.Bodies.rectangle(
      start.x,
      start.y,
      SHARED_CONFIG.SPRITE_SIZE,
      SHARED_CONFIG.SPRITE_SIZE,
      {
        label: id,
        ...ENEMY_CONFIG,
      }
    );

    Matter.World.add(world, [this._body]);

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

  getBody() {
    return this._body;
  }

  removePlayer() {
    console.log("player remove");
    Matter.World.remove(this._world, [this.getBody()]);
  }
}
