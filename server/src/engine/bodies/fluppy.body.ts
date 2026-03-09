import Matter from "matter-js";

import { Enemy as EnemyState } from "../../rooms/schema/Enemy";
import { Enemy } from "./enemy.body";
import { COLLISION_CATEGORY } from "../engine.config";

import { COMBAT_CONFIG } from "../../../../shared/shared.config";

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

    // Enemy attack hitbox — active only when isAttacking
    this._hitBox = Matter.Bodies.rectangle(
      this._body.position.x,
      this._body.position.y,
      COMBAT_CONFIG.HIT_BOX_SIZE,
      COMBAT_CONFIG.HIT_BOX_SIZE,
      {
        label: id,
        isSensor: true,
        collisionFilter: { category: COLLISION_CATEGORY.ENEMY_HIT_BOX, mask: 0 },
      }
    );

    // Enemy hurtbox — always active, receives player hit
    this._hurtBox = Matter.Bodies.rectangle(
      this._body.position.x,
      this._body.position.y,
      COMBAT_CONFIG.HURT_BOX_SIZE,
      COMBAT_CONFIG.HURT_BOX_SIZE,
      { label: id, ...HURT_BOX_CONFIG }
    );

    Matter.Composite.add(world, [this._hitBox, this._hurtBox]);

    Matter.Events.on(engine, "afterUpdate", () => {
      const x = this._body.position.x;
      const y = this._body.position.y;

      Matter.Body.setPosition(this._hurtBox, { x, y });
      Matter.Body.setPosition(this._hitBox, { x, y });

      // Hitbox active only during attack
      this._hitBox.collisionFilter.mask = this._enemyState?.isAttacking
        ? COLLISION_CATEGORY.PLAYER_HURT_BOX
        : 0;
    });
  }

  removePlayer() {
    Matter.World.remove(this._world, [this._body, this._hitBox, this._hurtBox]);
  }
}
