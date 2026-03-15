import { Anim } from "../characters.types";

// Keys follow the pattern `${texture}${Anim_value}` = "link" + Anim.LEFT = "linkLeft"
export const animLink: Record<string, Anim> = {
  UP: {
    start: 1, end: 4, zeroPad: 4,
    prefix: "link/walk/up/", suffix: ".png",
    key: "linkUp",
  },
  RIGHT: {
    start: 1, end: 4, zeroPad: 4,
    prefix: "link/walk/right/", suffix: ".png",
    key: "linkRight",
  },
  DOWN: {
    start: 1, end: 4, zeroPad: 4,
    prefix: "link/walk/down/", suffix: ".png",
    key: "linkDown",
  },
  LEFT: {
    start: 1, end: 4, zeroPad: 4,
    prefix: "link/walk/left/", suffix: ".png",
    key: "linkLeft",
  },
  IDLE_UP: {
    start: 1, end: 1, zeroPad: 4,
    prefix: "link/walk/up_static/", suffix: ".png",
    key: "linkIdleUp",
  },
  IDLE_RIGHT: {
    start: 1, end: 1, zeroPad: 4,
    prefix: "link/walk/right_static/", suffix: ".png",
    key: "linkIdleRight",
  },
  IDLE_DOWN: {
    start: 1, end: 14, zeroPad: 4,
    prefix: "link/walk/down_static/", suffix: ".png",
    key: "linkIdleDown",
  },
  IDLE_LEFT: {
    start: 1, end: 1, zeroPad: 4,
    prefix: "link/walk/left_static/", suffix: ".png",
    key: "linkIdleLeft",
  },
  ATTACK_UP: {
    start: 1, end: 4, zeroPad: 4,
    prefix: "link/attack/up/", suffix: ".png",
    key: "linkUpAttack",
  },
  ATTACK_RIGHT: {
    start: 1, end: 4, zeroPad: 4,
    prefix: "link/attack/right/", suffix: ".png",
    key: "linkRightAttack",
  },
  ATTACK_DOWN: {
    start: 1, end: 4, zeroPad: 4,
    prefix: "link/attack/down/", suffix: ".png",
    key: "linkDownAttack",
  },
  ATTACK_LEFT: {
    start: 1, end: 4, zeroPad: 4,
    prefix: "link/attack/left/", suffix: ".png",
    key: "linkLeftAttack",
  },
  HIT_UP: {
    start: 1, end: 6, zeroPad: 4,
    prefix: "link/hit/up/", suffix: ".png",
    key: "linkUpHit",
  },
  HIT_RIGHT: {
    start: 1, end: 5, zeroPad: 4,  // 0006 has a filename typo in atlas
    prefix: "link/hit/right/", suffix: ".png",
    key: "linkRightHit",
  },
  HIT_DOWN: {
    start: 1, end: 6, zeroPad: 4,
    prefix: "link/hit/down/", suffix: ".png",
    key: "linkDownHit",
  },
  HIT_LEFT: {
    start: 1, end: 6, zeroPad: 4,
    prefix: "link/hit/left/", suffix: ".png",
    key: "linkLeftHit",
  },
};
