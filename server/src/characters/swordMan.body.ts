import Matter from "matter-js";

import { BodyConfig, Player, Options } from "./player.body";
import { sharedConfig } from "../../../shared/config";
import { COLLISION_CATEGORY } from "../engine/config";
import { DIRECTION } from "../../../shared/types";

const HIT_BOX_CONFIG = {
  isSensor: true,
  collisionFilter: {
    category: COLLISION_CATEGORY.HIT_BOX,
    // mask: COLLISION_CATEGORY.HIT_BOX,
  },
};

const HIT_BOX_OFFSET = 20;

export class SwordMan extends Player {
  id: string;
  _world: Matter.World;
  private _hitBox: Matter.Body;
  private _engine: Matter.Engine;

  constructor(
    id: string,
    world: Matter.World,
    engine: Matter.Engine,
    config: BodyConfig
  ) {
    super(id, world, config);

    this._engine = engine;
    this._world = world;

    this._hitBox = Matter.Bodies.rectangle(
      this._body.position.x,
      this._body.position.y,
      sharedConfig.SPRITE_SIZE + HIT_BOX_OFFSET,
      sharedConfig.SPRITE_SIZE,
      { ...HIT_BOX_CONFIG, label: id }
    );

    Matter.Composite.add(world, [this._hitBox]);

    Matter.Events.on(engine, "afterUpdate", () => {
      Matter.Body.setPosition(this._hitBox, {
        x: this._body.position.x,
        y: this._body.position.y,
      });
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
