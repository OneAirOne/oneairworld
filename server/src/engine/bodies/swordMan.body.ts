import Matter from "matter-js";

import { Player as PlayerState } from "../../rooms/schema/Player";
import { Player, PLAYER_CONFIG } from "./player.body";
import { COLLISION_CATEGORY } from "../engine.config";

import { Characters, DIRECTION } from "../../../../shared/types";
import { getCharCombatConfig } from "../../../../shared/shared.config";

const HIT_BOX_CONFIG = {
  isSensor: true,
  collisionFilter: {
    category: COLLISION_CATEGORY.HIT_BOX,
    mask: COLLISION_CATEGORY.PLAYER | COLLISION_CATEGORY.HURT_BOX,
  },
};

// TODO: create a base class for melee characters that handles the hitbox logic, and have SwordMan extend it. Archer (Link) will be a separate class that extends Player directly and has its own arrow logic, since the hitbox logic is different (active during arrow flight, not player attack)  
export class SwordMan extends Player {
  protected _world: Matter.World;
  private _hitBox: Matter.Body;
  private _hurtBox: Matter.Body;
  id: string;

  // Archer (Link) arrow firing
  arrowRequested: boolean = false;
  arrowCooldown: number = 0;

  constructor(
    id: string,
    world: Matter.World,
    engine: Matter.Engine,
    playerState: PlayerState,
    spawnX: number = 0,
    spawnY: number = 0,
  ) {
    super(id, world, engine, playerState, spawnX, spawnY);

    const cc = getCharCombatConfig(playerState.texture);

    this._hitBox = Matter.Bodies.rectangle(
      this._body.position.x,
      this._body.position.y,
      cc.hitBoxSize,
      cc.hitBoxSize,
      { label: id, ...HIT_BOX_CONFIG }
    );

    // Player hurtbox — always active, receives enemy hit
    this._hurtBox = Matter.Bodies.rectangle(
      this._body.position.x,
      this._body.position.y,
      cc.hurtBoxW,
      cc.hurtBoxH,
      {
        label: id,
        isSensor: true,
        collisionFilter: {
          category: COLLISION_CATEGORY.PLAYER_HURT_BOX,
          mask: COLLISION_CATEGORY.ENEMY_HIT_BOX | COLLISION_CATEGORY.ARROW_HIT_BOX,
        },
      }
    );

    Matter.Composite.add(world, [this._hitBox, this._hurtBox]);

    const ACTIVE_MASK = COLLISION_CATEGORY.PLAYER | COLLISION_CATEGORY.HURT_BOX;

    /**
     * Move the hitbox in front of the player based on direction.
     * Only active (mask > 0) when the player is attacking.
     */
    Matter.Events.on(engine, "afterUpdate", () => {
      const isAttacking = this?._playerState?.isAttacking ?? false;
      const isArcher = this?._playerState?.texture === Characters.LINK;
      this._hitBox.collisionFilter.mask = (isAttacking && !isArcher) ? ACTIVE_MASK : 0;

      const x = this._body.position.x;
      const y = this._body.position.y;

      // Keep hurtbox on player, shifted toward feet by hurtBoxOffsetY
      Matter.Body.setPosition(this._hurtBox, { x, y: y + cc.hurtBoxOffsetY });

      if (this?._playerState?.direction === DIRECTION.UP) {
        Matter.Body.setPosition(this._hitBox, { x, y: y - cc.hitBoxOffsetUp });
      } else if (this?._playerState?.direction === DIRECTION.DOWN) {
        Matter.Body.setPosition(this._hitBox, { x, y: y + cc.hitBoxOffsetDown });
      } else if (this?._playerState?.direction === DIRECTION.LEFT) {
        Matter.Body.setPosition(this._hitBox, { x: x - cc.hitBoxOffsetLeft, y: y + cc.hitBoxOffsetLRY });
      } else if (this?._playerState?.direction === DIRECTION.RIGHT) {
        Matter.Body.setPosition(this._hitBox, { x: x + cc.hitBoxOffsetRight, y: y + cc.hitBoxOffsetLRY });
      }
    });
  }

  /** Remove all bodies from the world without destroying them */
  detachFromWorld() {
    Matter.World.remove(this._world, [this._body, this._hitBox, this._hurtBox]);
  }

  /** Re-add all bodies to a (potentially new) zone world at a given position */
  attachToWorld(world: Matter.World, x: number, y: number) {
    this._world = world;
    Matter.Body.setPosition(this._body, { x, y });
    Matter.Body.setVelocity(this._body, { x: 0, y: 0 });
    Matter.Body.setStatic(this._body, false);
    Matter.Body.setMass(this._body, PLAYER_CONFIG.mass);
    Matter.World.add(this._world, [this._body, this._hitBox, this._hurtBox]);
  }

  /**
   * Override of player function
   * Remove the hitbox
   */
  removePlayer() {
    Matter.World.remove(this._world, [this._body, this._hitBox, this._hurtBox]);
  }
}
