import Phaser from "phaser";

// ---- Speaking bubble ----

const BUBBLE_FONT_SIZE = "16px";
const BUBBLE_RESOLUTION = 4;
const BUBBLE_SCALE = 0.5;

export function getBubblePosition(
  sprite: Phaser.GameObjects.Sprite,
  offsetX = 4,
  offsetY = 0
): { x: number; y: number } {
  return {
    x: sprite.x + offsetX,
    y: sprite.y - sprite.displayHeight / 2 + offsetY,
  };
}

export function createSpeakingBubble(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Sprite,
  offsetX = 4,
  offsetY = 2
): Phaser.GameObjects.Text {
  const pos = getBubblePosition(sprite, offsetX, offsetY);
  return scene.add
    .text(pos.x, pos.y, "💬", {
      fontSize: BUBBLE_FONT_SIZE,
      resolution: BUBBLE_RESOLUTION,
      padding: { top: 6, bottom: 2, left: 2, right: 2 },
    })
    .setOrigin(0.5, 1)
    .setDepth(9999)
    .setScale(BUBBLE_SCALE)
    .setVisible(false);
}

interface Options {
  lastServerX: number;
  lastServerY: number;
  clientX: number;
  clientY: number;
}

export function updateDebug(debug: Phaser.GameObjects.Text, options: Options) {
  console.log(debug);
  debug.text = `
ServerX ${options.lastServerX.toFixed(2)}, ClientX ${options.clientX.toFixed(2)}
ServerY ${options.lastServerY.toFixed(2)} ClientY ${options.clientY.toFixed(
    2
  )}`;
}

export async function waitFor(time: number = 500): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}
