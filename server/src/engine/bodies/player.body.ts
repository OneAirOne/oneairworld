import Matter from "matter-js";

import { Player as PlayerState } from "../../rooms/schema/Player";
import { COLLISION_CATEGORY } from "../engine.config";

import { SHARED_CONFIG } from "../../../../shared/shared.config";
import { DIRECTION } from "../../../../shared/types";

export interface BodyConfig {
  label: string;
  collisionFilter: Matter.ICollisionFilter;
}

const PLAYER_CONFIG = {
  collisionFilter: {
    category: COLLISION_CATEGORY.PLAYER,
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

export class Player {
  protected _world: Matter.World;
  protected _body: Matter.Body;
  protected _engine: Matter.Engine;
  protected _playerState: PlayerState;
  id: string;
  isAttacking: boolean = false;

  constructor(
    id: string,
    world: Matter.World,
    engine: Matter.Engine,
    playerState: PlayerState
  ) {
    this.id = id;
    this._engine = engine;
    this._world = world;
    this._playerState = playerState;

    this._body = Matter.Bodies.rectangle(
      SHARED_CONFIG.WORLD_WIDTH / 2,
      SHARED_CONFIG.WORLD_HEIGHT / 2,
      SHARED_CONFIG.SPRITE_SIZE,
      SHARED_CONFIG.SPRITE_SIZE,
      {
        label: id,
        ...PLAYER_CONFIG,
      }
    );

    Matter.World.add(world, [this._body]);

    Matter.Events.on(engine, "afterUpdate", () => {
      if (
        this?._playerState?.collisionDirection === DIRECTION.DOWN &&
        this?._playerState?.isCollided
      ) {
        Matter.Body.applyForce(this._body, this._body.position, {
          x: 0,
          y: -FORCE,
        });

        if (this?._playerState?.isCollided) {
          this._playerState.isCollided = false;
        }
      }
      if (
        this?._playerState?.collisionDirection === DIRECTION.UP &&
        this?._playerState?.isCollided
      ) {
        Matter.Body.applyForce(this._body, this._body.position, {
          x: 0,
          y: +FORCE,
        });

        if (this?._playerState?.isCollided) {
          this._playerState.isCollided = false;
        }
      }
      if (
        this?._playerState?.collisionDirection === DIRECTION.LEFT &&
        this?._playerState?.isCollided
      ) {
        Matter.Body.applyForce(this._body, this._body.position, {
          x: FORCE,
          y: 0,
        });

        if (this?._playerState?.isCollided) {
          this._playerState.isCollided = false;
        }
      }
      if (
        this?._playerState?.collisionDirection === DIRECTION.RIGHT &&
        this?._playerState?.isCollided
      ) {
        Matter.Body.applyForce(this._body, this._body.position, {
          x: -FORCE,
          y: 0,
        });

        if (this?._playerState?.isCollided) {
          this._playerState.isCollided = false;
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
