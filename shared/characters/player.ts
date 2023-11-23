import { Anim, InputPayload, PLAYER_VELOCITY } from "../types";

export function processPlayerAction(
  matterInstance: any,
  body: any,
  input: InputPayload,
  updateAnim: (anim: Anim) => void
) {
  const { setVelocity } = matterInstance?.body || matterInstance?.Body;

  let vx = 0;
  let vy = 0;

  if (!body || !matterInstance) return;

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

  setVelocity(body, { x: vx, y: vy });
}
