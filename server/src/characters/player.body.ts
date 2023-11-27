import Matter from "matter-js";
import { sharedConfig } from "../../../shared/config";

export interface BodyConfig {
  label: string;
  collisionFilter: Matter.ICollisionFilter;
}

export class Player {
  id: string;
  _world: Matter.World;
  protected _body: Matter.Body;

  isAttacking: boolean = false;

  constructor(id: string, world: Matter.World, config: BodyConfig) {
    this.id = id;
    this._world = world;
    this._body = Matter.Bodies.rectangle(
      sharedConfig.WORLD_WIDTH / 2,
      sharedConfig.WORLD_HEIGHT / 2,
      sharedConfig.SPRITE_SIZE,
      sharedConfig.SPRITE_SIZE,
      config
    );

    Matter.World.add(world, [this._body]);
  }

  getBody() {
    return this._body;
  }

  removePlayer() {
    console.log("player remove");
    Matter.World.remove(this._world, [this.getBody()]);
  }
}
