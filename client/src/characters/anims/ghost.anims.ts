import { Anim } from "../characters.types";

export const animWizard: Record<string, Anim> = {
  IDLE: {
    start: 1,
    end: 8,
    zeroPad: 3,
    prefix: "ghost/iddle",
    suffix: ".png",
    key: "ghostIdle",
  },
};
