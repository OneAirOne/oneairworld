import Matter from "matter-js";

import { Enemy as EnemyState } from "../../rooms/schema/Enemy";
import { Enemy } from "./enemy.body";
import { COLLISION_CATEGORY } from "../engine.config";

import { DIRECTION } from "../../../../shared/types";
import { COMBAT_CONFIG } from "../../../../shared/shared.config";

const HIT_BOX_CONFIG = {
  isSensor: true,
  collisionFilter: {
    category: COLLISION_CATEGORY.HIT_BOX,
    mask: COLLISION_CATEGORY.HURT_BOX,
  },
};

const HURT_BOX_CONFIG = {
  isSensor: true,
  collisionFilter: {
    category: COLLISION_CATEGORY.HURT_BOX,
    mask: COLLISION_CATEGORY.HIT_BOX,
  },
};

export class Fluppy extends Enemy {
  protected _world: Matter.World;
  private _hitBox: Matter.Body;
  private _hurtBox: Matter.Body;

  constructor(
    id: string,
    world: Matter.World,
    engine: Matter.Engine,
    enemyState: EnemyState,
    position?: { x: number; y: number }
  ) {
    super(id, world, engine, enemyState, position);

    // Attack hitbox (for future enemy→player damage)
    this._hitBox = Matter.Bodies.rectangle(
      this._body.position.x,
      this._body.position.y,
      COMBAT_CONFIG.HIT_BOX_SIZE,
      COMBAT_CONFIG.HIT_BOX_SIZE,
      { label: id, ...HIT_BOX_CONFIG }
    );

    // Hurtbox — damage-receiving zone centered on body
    this._hurtBox = Matter.Bodies.rectangle(
      this._body.position.x,
      this._body.position.y,
      COMBAT_CONFIG.HURT_BOX_SIZE,
      COMBAT_CONFIG.HURT_BOX_SIZE,
      { label: id, ...HURT_BOX_CONFIG }
    );

    Matter.Composite.add(world, [this._hitBox, this._hurtBox]);

    /**
     * Keep hitbox and hurtbox synced with body position
     */
    Matter.Events.on(engine, "afterUpdate", () => {
      const x = this._body.position.x;
      const y = this._body.position.y;
      const offset = COMBAT_CONFIG.HIT_BOX_OFFSET;

      // Hurtbox stays centered on body
      Matter.Body.setPosition(this._hurtBox, { x, y });

      // Hitbox moves in front based on direction
      if (this?._enemyState?.direction === DIRECTION.UP) {
        Matter.Body.setPosition(this._hitBox, { x, y: y - offset });
      } else if (this?._enemyState?.direction === DIRECTION.DOWN) {
        Matter.Body.setPosition(this._hitBox, { x, y: y + offset });
      } else if (this?._enemyState?.direction === DIRECTION.LEFT) {
        Matter.Body.setPosition(this._hitBox, { x: x - offset, y });
      } else if (this?._enemyState?.direction === DIRECTION.RIGHT) {
        Matter.Body.setPosition(this._hitBox, { x: x + offset, y });
      }
    });
  }

  removePlayer() {
    Matter.World.remove(this._world, [this._body, this._hitBox, this._hurtBox]);
  }
}
