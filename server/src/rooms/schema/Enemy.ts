import { Schema, type } from "@colyseus/schema";

import { COMBAT_CONFIG } from "../../../../shared/shared.config";

import {
  Characters,
  DIRECTION,
  EnemyTextures,
} from "../../../../shared/types";

import { ANIM_START } from "../../constants";
import { SERVER_CONFIG } from "../../server.config";
import { getTiledInfos } from "../../engine/bodies";

const { start } = getTiledInfos();

export class Enemy extends Schema {
  @type("string") id = "";
  @type("number") x = start.x;
  @type("number") y = start.y;

  @type("string") anim = ANIM_START;
  @type("string") texture = Characters.FLUPPY;
  @type("string") direction = DIRECTION.DOWN;
  @type("boolean") isAttacking = false;
  @type("number") life = 100;
  @type("boolean") isDead = false;
  @type("boolean") isCollided = false;
  @type("string") collisionDirection = DIRECTION.DOWN;

  decreaseLife() {
    const unit = COMBAT_CONFIG.ENEMY_HIT_DAMAGE;
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
