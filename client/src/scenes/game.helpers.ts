import Phaser from "phaser";
import { TilesetConfig, TiledLayer } from "./road.config";
import CLIENT_CONFIG from "client.config";

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

/**
 * Add tilesets to a tilemap from a config array.
 * Returns the array of Phaser tilesets ready to pass to createLayer().
 */
export function buildTilesets(
  map: Phaser.Tilemaps.Tilemap,
  tilesets: TilesetConfig[]
): Phaser.Tilemaps.Tileset[] {
  return tilesets
    .map((ts) => map.addTilesetImage(ts.name, ts.name))
    .filter((ts): ts is Phaser.Tilemaps.Tileset => ts !== null);
}

/**
 * Display a full-screen scene title that fades out after a short hold.
 * Uses setScrollFactor(0) so it stays fixed on screen regardless of camera
 * position or zoom. Font size is responsive (scales with the smallest dimension).
 */
export function showSceneTitle(scene: Phaser.Scene, title: string) {
  const cam   = scene.cameras.main;
  const W     = cam.width;
  const H     = cam.height;
  const depth = 999999;

  // Semi-transparent black overlay
  const overlay = scene.add
    .rectangle(W / 2, H / 2, W, H, 0x000000, 0.55)
    .setScrollFactor(0)
    .setDepth(depth);

  // Responsive font: 10 % of the shortest screen dimension, clamped 28–120 px
  const fontSize = Math.round(Math.min(Math.min(W, H) * 0.06, 64));

  const text = scene.add
    .text(W / 2, H / 2, title, {
      fontSize:   `${fontSize}px`,
      fontStyle:  "bold",
      color:      "#ffffff",
      stroke:     "#000000",
      strokeThickness: Math.max(2, fontSize * 0.06),
      resolution: 2,
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(depth + 1);

  // Hold 1.2 s then fade out over 0.9 s
  scene.time.delayedCall(1200, () => {
    scene.tweens.add({
      targets:  [overlay, text],
      alpha:    0,
      duration: 900,
      ease:     "Power2",
      onComplete: () => { overlay.destroy(); text.destroy(); },
    });
  });
}

/**
 * Render collision debug overlay for a tilemap layer (only when CLIENT_CONFIG.DEBUG is true).
 * - COLLIDE_UNDER_PLAYER: green  (#8BE928)
 * - COLLIDE_ABOVE_PLAYER: yellow (#F3EA28)
 */
/**
 * Mark all collidable tiles in a collision layer.
 * Tries the "collide" custom property first (Road tilesets),
 * falls back to all non-empty tiles (Interior tilesets).
 * Always runs, regardless of DEBUG mode.
 */
export function setupCollisionLayer(layer: Phaser.Tilemaps.TilemapLayer): void {
  layer.setCollisionByProperty({ collide: true });
  const hasCollision = layer.filterTiles((t: Phaser.Tilemaps.Tile) => t.collides).length > 0;
  if (!hasCollision) layer.setCollisionByExclusion([-1]);
}

export function renderCollisionDebug(
  scene: Phaser.Scene,
  layer: Phaser.Tilemaps.TilemapLayer,
  layerName: TiledLayer,
  debugDepth: number
): void {
  const isUnder = layerName === TiledLayer.COLLIDE_UNDER_PLAYER;
  const isAbove = layerName === TiledLayer.COLLIDE_ABOVE_PLAYER;
  if (!isUnder && !isAbove) return;

  setupCollisionLayer(layer);

  if (!CLIENT_CONFIG.DEBUG) return;

  const color = isUnder
    ? new Phaser.Display.Color(139, 233, 40, 255)
    : new Phaser.Display.Color(243, 234, 40, 255);

  const debugGraphics = scene.add.graphics().setAlpha(0.7).setDepth(debugDepth);
  layer.renderDebug(debugGraphics, {
    tileColor: null,
    collidingTileColor: color,
    faceColor: new Phaser.Display.Color(40, 39, 37, 255),
  });
}

export async function waitFor(time: number = 500): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}
