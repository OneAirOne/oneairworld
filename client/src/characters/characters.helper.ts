import Phaser from "phaser";

import { Anim } from "./characters.types";

import gameConfig from "game.config";

/**
 *  Use the "characters" sprite sheet and create anims
 *  for each key with associated frames
 */
export const createCharacterAnims = (
  animConfig: Record<string, Anim>,
  frameRate: number,
  anims: Phaser.Animations.AnimationManager
) => {
  for (let key of Object.keys(animConfig)) {
    const anim = animConfig[key];

    let frames = anims.generateFrameNames(gameConfig.CHARACTERS.NAME, {
      start: anim.start,
      end: anim.end,
      zeroPad: anim.zeroPad,
      prefix: anim.prefix,
      suffix: anim.suffix,
    });

    anims.create({
      key: anim.key,
      frames,
      frameRate,
      repeat: -1,
    });
  }
};
