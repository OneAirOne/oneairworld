import { Anim, InputPayload } from "./types";

/**
 * Get the iddle anim name given an input paload
 */
export function getIddleAnim(inputPayload: InputPayload, lastAnim: Anim) {
  let iddleAnim: Anim | null = null;

  const noPressKeys =
    !inputPayload.left &&
    !inputPayload.right &&
    !inputPayload.up &&
    !inputPayload.down;

  if (noPressKeys) {
    if (lastAnim === Anim.UP) {
      iddleAnim = Anim.IDDLE_UP;
    }
    if (lastAnim === Anim.DOWN) {
      iddleAnim = Anim.IDDLE_DOWN;
    }
    if (lastAnim === Anim.LEFT) {
      iddleAnim = Anim.IDDLE_LEFT;
    }
    if (lastAnim === Anim.RIGHT) {
      iddleAnim = Anim.IDDLE_RIGHT;
    }
  }

  return iddleAnim;
}
