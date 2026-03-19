import { Anim } from "../characters.types";

export const animJohn: Record<string, Anim> = {
  IDLE: {
    start: 1,
    end: 3,
    zeroPad: 4,
    prefix: "john/iddle",
    suffix: ".png",
    key: "johnIdle",
  },
};
