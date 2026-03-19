import { Anim } from "../characters.types";

export const animWendy: Record<string, Anim> = {
  IDLE: {
    start: 1,
    end: 3,
    zeroPad: 4,
    prefix: "wendy/iddle",
    suffix: ".png",
    key: "wendyIdle",
  },
};
