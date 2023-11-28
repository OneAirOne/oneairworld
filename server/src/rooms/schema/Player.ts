import { Schema, type } from "@colyseus/schema";

import { sharedConfig } from "../../../../shared/config";

import { Characters, DIRECTION, type IPlayer } from "../../../../shared/types";

import { ANIM_START } from "../../constants";
import { SERVER_CONFIG } from "../../config";

export class Player extends Schema implements IPlayer {
  @type("string") name = "";
  @type("number") x = sharedConfig.WORLD_WIDTH / 2;
  @type("number") y = sharedConfig.WORLD_HEIGHT / 2;
  @type("string") anim = ANIM_START;
  @type("string") texture = Characters.ONEAIR;
  @type("string") direction = DIRECTION.DOWN;
  @type("boolean") isAttacking = false;
  @type("number") life = 100;
  @type("boolean") isDead = false;
  @type("boolean") isCollided = false;
  @type("string") collisionDirection = DIRECTION.DOWN;

  inputQueue: any[] = [];

  decreaseLife() {
    const unit = 5;
    if (this.life - unit <= 0) {
      if (SERVER_CONFIG.debug) {
        this.life = 100;
      } else {
        this.life = 0;
      }
      this.isDead = true;
    } else {
      this.life -= unit;
    }
  }
}
