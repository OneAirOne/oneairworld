import Matter from "matter-js";

import {
  Anim,
  Characters,
  DIRECTION,
  InputPayload,
  PLAYER_VELOCITY,
} from "../../../../shared/types";
import { ARROW_CONFIG, PLAYER_CONFIG } from "../../../../shared/shared.config";
import { Player } from "../../rooms/schema";
import { SwordMan } from "../bodies";

/**
 * Check when no input key are pressed
 */
function noPressKeys(input: InputPayload): boolean {
  return (
    !input.left && !input.right && !input.up && !input.down && !input.space
  );
}

/**
 * Get the iddle anim name given an input paload
 */
function getIddleAnim(lastAnim: Anim) {
  let iddleAnim: Anim | null = null;

  if (isLeft(lastAnim)) {
    iddleAnim = Anim.IDDLE_LEFT;
  }
  if (isRight(lastAnim)) {
    iddleAnim = Anim.IDDLE_RIGHT;
  }
  if (isUp(lastAnim)) {
    iddleAnim = Anim.IDDLE_UP;
  }
  if (isDown(lastAnim)) {
    iddleAnim = Anim.IDDLE_DOWN;
  }

  return iddleAnim;
}

/**
 * Check if last direction was left
 */
function isLeft(lastAnim: Anim) {
  if (
    lastAnim === Anim.IDDLE_LEFT ||
    lastAnim === Anim.LEFT ||
    lastAnim === Anim.ATTACK_LEFT ||
    lastAnim === Anim.HIT_LEFT
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * Check if last direction was right
 */
function isRight(lastAnim: Anim) {
  if (
    lastAnim === Anim.IDDLE_RIGHT ||
    lastAnim === Anim.RIGHT ||
    lastAnim === Anim.ATTACK_RIGHT ||
    lastAnim === Anim.HIT_RIGHT
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * Check if last direction was up
 */
function isUp(lastAnim: Anim) {
  if (
    lastAnim === Anim.IDDLE_UP ||
    lastAnim === Anim.UP ||
    lastAnim === Anim.ATTACK_UP ||
    lastAnim === Anim.HIT_UP
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * Check if last direction was down
 */
function isDown(lastAnim: Anim) {
  if (
    lastAnim === Anim.IDDLE_DOWN ||
    lastAnim === Anim.DOWN ||
    lastAnim === Anim.ATTACK_DOWN ||
    lastAnim === Anim.HIT_DOWN
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * Update body according to the input
 */
export function processPlayerAction(
  body: SwordMan,
  player: Player,
  input: InputPayload,
  updateAnim: (anim: Anim) => void
) {
  let vx = 0;
  let vy = 0;
  const speed = input.sprint ? PLAYER_VELOCITY * PLAYER_CONFIG.SPRINT_VELOCITY : PLAYER_VELOCITY;

  // MOVES
  if (input.left) {
    vx = -speed;
    vy = 0;
    updateAnim(Anim.LEFT);
    player.direction = DIRECTION.LEFT;
  } else if (input.right) {
    vx = speed;
    vy = 0;
    updateAnim(Anim.RIGHT);
    player.direction = DIRECTION.RIGHT;
  }

  if (input.up) {
    vx = 0;
    vy = -speed;
    updateAnim(Anim.UP);
    player.direction = DIRECTION.UP;
  } else if (input.down) {
    vx = 0;
    vy = speed;
    updateAnim(Anim.DOWN);
    player.direction = DIRECTION.DOWN;
  }

  // ATTACK
  if (input.space) {
    vx = 0;
    vy = 0;

    if (player.texture === Characters.LINK) {
      // Archer: fire an arrow (edge-triggered with cooldown, no sword hitbox)
      if (body.arrowCooldown <= 0) {
        body.arrowRequested = true;
        body.arrowCooldown = ARROW_CONFIG.FIRE_COOLDOWN;
      }
      player.isAttacking = false;
    } else {
      player.isAttacking = true;
    }

    if (isLeft(player.anim as Anim)) updateAnim(Anim.ATTACK_LEFT);
    if (isRight(player.anim as Anim)) updateAnim(Anim.ATTACK_RIGHT);
    if (isUp(player.anim as Anim)) updateAnim(Anim.ATTACK_UP);
    if (isDown(player.anim as Anim)) updateAnim(Anim.ATTACK_DOWN);
  } else {
    player.isAttacking = false;
  }

  // NO KEY PRESSED
  if (noPressKeys(input)) {
    const iddleAnim = getIddleAnim(player.anim as Anim);
    if (iddleAnim) {
      player.anim = iddleAnim;
    }
  }

  // TODO: create a fonction in player
  Matter.Body.setVelocity(body.getBody(), { x: vx, y: vy });
}
