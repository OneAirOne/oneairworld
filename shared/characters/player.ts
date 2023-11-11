import Matter from "matter-js";

import { Anim, InputPayload, PLAYER_VELOCITY } from "../types";

export function processPlayerAction(
  body: any,
  input: InputPayload,
  delta: number,
  updateAnim: (anim: Anim) => void
) {
  let vx = 0;
  let vy = 0;

  if (!body) return;

  if (input.left) {
    console.log("hit", body);
    vx = -(PLAYER_VELOCITY * delta);
    vy = 0;
    updateAnim(Anim.LEFT);
  } else if (input.right) {
    vx = PLAYER_VELOCITY * delta;
    vy = 0;
    updateAnim(Anim.RIGHT);
  }

  if (input.up) {
    vx = 0;
    vy = -(PLAYER_VELOCITY * delta);
    updateAnim(Anim.UP);
  } else if (input.down) {
    vx = 0;
    vy = PLAYER_VELOCITY * delta;
    updateAnim(Anim.DOWN);
  }

  // Matter.Body.setVelocity(body, { x: vx, y: vy });
}
