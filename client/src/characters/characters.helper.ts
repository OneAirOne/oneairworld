import Phaser from "phaser";

import { Anim } from "./characters.types";

import CLIENT_CONFIG from "client.config";

/**
 *  Use the "characters" sprite sheet and create anims
 *  for each key with associated frames
 */
export function createAnim(
  animConfig: Record<string, Anim>,
  frameRate: number,
  scene: Phaser.Scene,
  spriteSheetName: string = CLIENT_CONFIG.CHARACTERS.NAME
) {
  for (let key of Object.keys(animConfig)) {
    const anim = animConfig[key];

    let frames = scene.anims.generateFrameNames(spriteSheetName, {
      start: anim.start,
      end: anim.end,
      zeroPad: anim.zeroPad,
      prefix: anim.prefix,
      suffix: anim.suffix,
    });
    scene.anims.create({
      key: anim.key,
      frames,
      frameRate,
      repeat: 0,
    });
  }
}
