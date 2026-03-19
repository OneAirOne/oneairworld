import Matter from "matter-js";
import { COLLISION_CATEGORY } from "../engine.config";
import { DIRECTION } from "../../../../shared/types";
import { ARROW_CONFIG } from "../../../../shared/shared.config";

export class ArrowBody {
  private _body: Matter.Body;
  private _world: Matter.World;
  private _vx: number;
  private _vy: number;

  id: string;
  ownerId: string;
  direction: DIRECTION;
  distanceTraveled: number = 0;

  constructor(
    id: string,
    ownerId: string,
    world: Matter.World,
    x: number,
    y: number,
    direction: DIRECTION
  ) {
    this.id = id;
    this.ownerId = ownerId;
    this._world = world;
    this.direction = direction;

    const s = ARROW_CONFIG.SPEED;
    this._vx = direction === DIRECTION.LEFT ? -s : direction === DIRECTION.RIGHT ? s : 0;
    this._vy = direction === DIRECTION.UP   ? -s : direction === DIRECTION.DOWN  ? s : 0;

    this._body = Matter.Bodies.rectangle(x, y, ARROW_CONFIG.SIZE, ARROW_CONFIG.SIZE, {
      label: id,
      isSensor: true,
      isStatic: false,
      frictionAir: 0,
      collisionFilter: {
        category: COLLISION_CATEGORY.ARROW_HIT_BOX,
        mask: COLLISION_CATEGORY.WALL | COLLISION_CATEGORY.HURT_BOX | COLLISION_CATEGORY.PLAYER_HURT_BOX,
      },
    });

    Matter.World.add(world, [this._body]);
    Matter.Body.setVelocity(this._body, { x: this._vx, y: this._vy });
  }

  getBody() {
    return this._body;
  }

  /** Returns true when the arrow should be removed */
  tick(deltaTime: number): boolean {
    // Keep constant velocity each tick (no drag)
    Matter.Body.setVelocity(this._body, { x: this._vx, y: this._vy });
    this.distanceTraveled += ARROW_CONFIG.SPEED * (deltaTime / 16.67);
    return this.distanceTraveled >= ARROW_CONFIG.MAX_DISTANCE;
  }

  remove() {
    Matter.World.remove(this._world, [this._body]);
  }
}
