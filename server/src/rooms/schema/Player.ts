import { Schema, type } from "@colyseus/schema";

import { COMBAT_CONFIG } from "../../../../shared/shared.config";

import { Characters, DIRECTION, Zone } from "../../../../shared/types";

import { ANIM_START } from "../../constants";
import { SERVER_CONFIG } from "../../server.config";
import { getTiledInfos } from "../../engine/bodies";

const { start } = getTiledInfos(Zone.ROAD);

export class Player extends Schema {
  @type("string") name = "";
  @type("number") x = start.x;
  @type("number") y = start.y;

  @type("string") anim = ANIM_START;
  @type("string") texture = Characters.ONEAIR;
  @type("string") direction = DIRECTION.DOWN;
  @type("boolean") isAttacking = false;
  @type("number") life = 100;
  @type("boolean") isDead = false;
  @type("boolean") isSpeaking = false;
  @type("boolean") isCollided = false;
  @type("string") collisionDirection = DIRECTION.DOWN;
  @type("string") zone: string = Zone.ROAD;
  @type("number") coins: number = 0;
  @type("boolean") hasSpeedBoost: boolean = false;

  inputQueue: any[] = [];

  decreaseLife(damage: number = COMBAT_CONFIG.PLAYER_HIT_DAMAGE) {
    const unit = damage;
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
