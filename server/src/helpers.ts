import Matter from "matter-js";

import { Anim, InputPayload, PLAYER_VELOCITY } from "../../shared/types";
import { Player } from "./rooms/schema";

/**
 * Check when no input key are pressed
 */
function noPressKeys(input: InputPayload): boolean {
  return (
    !input.left && !input.right && !input.up && !input.down && !input.space
  );
}

/**
 * Update body according to the input
 */
export function processPlayerAction(
  body: Matter.Body,
  player: Player,
  input: InputPayload,
  updateAnim: (anim: Anim) => void
) {
  let vx = 0;
  let vy = 0;

  // MOVES
  if (input.left) {
    vx = -PLAYER_VELOCITY;
    vy = 0;
    updateAnim(Anim.LEFT);
  } else if (input.right) {
    vx = PLAYER_VELOCITY;
    vy = 0;
    updateAnim(Anim.RIGHT);
  }

  if (input.up) {
    vx = 0;
    vy = -PLAYER_VELOCITY;
    updateAnim(Anim.UP);
  } else if (input.down) {
    vx = 0;
    vy = PLAYER_VELOCITY;
    updateAnim(Anim.DOWN);
  }

  // ATTACK
  if (input.space) {
    vx = 0;
    vy = 0;
    if (isLeft(player.anim as Anim)) {
      updateAnim(Anim.ATTACK_LEFT);
    }
    if (isRight(player.anim as Anim)) {
      updateAnim(Anim.ATTACK_RIGHT);
    }
    if (isUp(player.anim as Anim)) {
      updateAnim(Anim.ATTACK_UP);
    }
    if (isDown(player.anim as Anim)) {
      updateAnim(Anim.ATTACK_DOWN);
    }
  }

  // NO KEY PRESSED
  if (noPressKeys(input)) {
    const iddleAnim = getIddleAnim(player.anim as Anim);
    if (iddleAnim) {
      player.anim = iddleAnim;
    }
  }

  Matter.Body.setVelocity(body, { x: vx, y: vy });
}

/**
 * Get the iddle anim name given an input paload
 */
export function getIddleAnim(lastAnim: Anim) {
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
export function isLeft(lastAnim: Anim) {
  if (
    lastAnim === Anim.IDDLE_LEFT ||
    lastAnim === Anim.LEFT ||
    lastAnim === Anim.ATTACK_LEFT
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * Check if last direction was right
 */
export function isRight(lastAnim: Anim) {
  if (
    lastAnim === Anim.IDDLE_RIGHT ||
    lastAnim === Anim.RIGHT ||
    lastAnim === Anim.ATTACK_RIGHT
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * Check if last direction was up
 */
export function isUp(lastAnim: Anim) {
  if (
    lastAnim === Anim.IDDLE_UP ||
    lastAnim === Anim.UP ||
    lastAnim === Anim.ATTACK_UP
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * Check if last direction was down
 */
export function isDown(lastAnim: Anim) {
  if (
    lastAnim === Anim.IDDLE_DOWN ||
    lastAnim === Anim.DOWN ||
    lastAnim === Anim.ATTACK_DOWN
  ) {
    return true;
  } else {
    return false;
  }
}
