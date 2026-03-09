import { Anim } from "../characters.types";

export const animWizard: Record<string, Anim> = {
  IDLE: {
    start: 1,
    end: 4,
    zeroPad: 4,
    prefix: "wizard/iddle",
    suffix: ".png",
    key: "wizardIdle",
  },
};
