import Matter from "matter-js";

import { Enemy as EnemyState } from "../../rooms/schema/Enemy";
import { Enemy } from "./enemy.body";
import { COLLISION_CATEGORY } from "../engine.config";

import { DIRECTION } from "../../../../shared/types";

const HIT_BOX_CONFIG = {
  isSensor: true,
  collisionFilter: {
    category: COLLISION_CATEGORY.HIT_BOX,
    mask: COLLISION_CATEGORY.ENEMY,
  },
};

const HIT_BOX_OFFSET = 15;

export class Fluppy extends Enemy {
  protected _world: Matter.World;
  private _hitBox: Matter.Body;
  id: string;

  constructor(
    id: string,
    world: Matter.World,
    engine: Matter.Engine,
    enemyState: EnemyState
  ) {
    super(id, world, engine, enemyState);

    this._hitBox = Matter.Body.create({
      position: { x: this._body.position.x, y: this._body.position.y },
      vertices: [
        { x: this._body.vertices[0].x, y: this._body.vertices[0].y },
        { x: this._body.vertices[1].x, y: this._body.vertices[1].y },
        { x: this._body.vertices[2].x, y: this._body.vertices[2].y },
        { x: this._body.vertices[3].x, y: this._body.vertices[3].y },
      ],
      label: id,
      ...HIT_BOX_CONFIG,
    });

    Matter.Composite.add(world, [this._hitBox]);

    /**
     * Move the hitbox according to the direction
     */
    Matter.Events.on(engine, "afterUpdate", () => {
      if (this?._enemyState?.direction === DIRECTION.UP) {
        Matter.Body.setPosition(this._hitBox, {
          x: this._body.position.x,
          y: this._body.position.y - HIT_BOX_OFFSET,
        });
      }
      if (this?._enemyState?.direction === DIRECTION.DOWN) {
        Matter.Body.setPosition(this._hitBox, {
          x: this._body.position.x,
          y: this._body.position.y + HIT_BOX_OFFSET,
        });
      }
      if (this?._enemyState?.direction === DIRECTION.LEFT) {
        Matter.Body.setPosition(this._hitBox, {
          x: this._body.position.x - HIT_BOX_OFFSET,
          y: this._body.position.y,
        });
      }
      if (this?._enemyState?.direction === DIRECTION.RIGHT) {
        Matter.Body.setPosition(this._hitBox, {
          x: this._body.position.x + HIT_BOX_OFFSET,
          y: this._body.position.y,
        });
      }
    });
  }

  /**
   * Override of player function
   * Remove the hitbox
   */
  removePlayer() {
    Matter.World.remove(this._world, [this._body, this._hitBox]);
  }
}
