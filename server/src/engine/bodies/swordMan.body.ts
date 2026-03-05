import Matter from "matter-js";

import { Player as PlayerState } from "../../rooms/schema/Player";
import { Player } from "./player.body";
import { COLLISION_CATEGORY } from "../engine.config";

import { DIRECTION } from "../../../../shared/types";
import { COMBAT_CONFIG } from "../../../../shared/shared.config";

const HIT_BOX_CONFIG = {
  isSensor: true,
  collisionFilter: {
    category: COLLISION_CATEGORY.HIT_BOX,
    mask: COLLISION_CATEGORY.PLAYER | COLLISION_CATEGORY.HURT_BOX,
  },
};

export class SwordMan extends Player {
  protected _world: Matter.World;
  private _hitBox: Matter.Body;
  id: string;

  constructor(
    id: string,
    world: Matter.World,
    engine: Matter.Engine,
    playerState: PlayerState
  ) {
    super(id, world, engine, playerState);

    const s = COMBAT_CONFIG.HIT_BOX_SIZE / 2;
    this._hitBox = Matter.Bodies.rectangle(
      this._body.position.x,
      this._body.position.y,
      COMBAT_CONFIG.HIT_BOX_SIZE,
      COMBAT_CONFIG.HIT_BOX_SIZE,
      { label: id, ...HIT_BOX_CONFIG }
    );

    Matter.Composite.add(world, [this._hitBox]);

    const ACTIVE_MASK = COLLISION_CATEGORY.PLAYER | COLLISION_CATEGORY.HURT_BOX;

    /**
     * Move the hitbox in front of the player based on direction.
     * Only active (mask > 0) when the player is attacking.
     */
    Matter.Events.on(engine, "afterUpdate", () => {
      const isAttacking = this?._playerState?.isAttacking ?? false;
      this._hitBox.collisionFilter.mask = isAttacking ? ACTIVE_MASK : 0;

      const offset = COMBAT_CONFIG.HIT_BOX_OFFSET;
      const x = this._body.position.x;
      const y = this._body.position.y;

      if (this?._playerState?.direction === DIRECTION.UP) {
        Matter.Body.setPosition(this._hitBox, { x, y: y - offset });
      } else if (this?._playerState?.direction === DIRECTION.DOWN) {
        Matter.Body.setPosition(this._hitBox, { x, y: y + offset });
      } else if (this?._playerState?.direction === DIRECTION.LEFT) {
        Matter.Body.setPosition(this._hitBox, { x: x - offset, y });
      } else if (this?._playerState?.direction === DIRECTION.RIGHT) {
        Matter.Body.setPosition(this._hitBox, { x: x + offset, y });
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
