import Phaser from "phaser";

// Network
import Network, { Network as NetworkType } from "services/Network";

// Others
import gameConfig from "game.config";
import { SCENES } from "./scene.config";

export class BootScene extends Phaser.Scene {
  private preloadComplete = false;
  network!: NetworkType;

  constructor() {
    super(SCENES.BOOT);
  }

  preload() {
    this.loadAssets();
    console.log("Preload boot scene ...");
  }

  loadAssets() {
    // Background
    this.load.image(
      gameConfig.BACKGROUND.BACKDROP.NAME,
      gameConfig.BACKGROUND.BACKDROP.PATH
    );
    this.load.atlas(
      gameConfig.BACKGROUND.CLOUD.NAME,
      gameConfig.BACKGROUND.CLOUD.SPRITE_SHEET_TEXTURE_PATH,
      gameConfig.BACKGROUND.CLOUD.SPRITE_SHEET_ATLAS_PATH
    );

    // Map
    this.load.image(gameConfig.MAP.NAME, gameConfig.MAP.TILESET_PATH);
    this.load.tilemapTiledJSON(
      gameConfig.MAP.NAME,
      gameConfig.MAP.TILEMAP_PATH
    );

    // Characteres
    this.load.atlas(
      gameConfig.CHARACTERS.NAME,
      gameConfig.CHARACTERS.SPRITE_SHEET_TEXTURE_PATH,
      gameConfig.CHARACTERS.SPRITE_SHEET_ATLAS_PATH
    );

    this.load.on("complete", () => {
      this.preloadComplete = true;
      this.launchBackground();
    });
  }

  private init() {
    this.network = Network;
  }

  private launchBackground() {
    this.scene.start(SCENES.BACKGROUND);
  }

  launchGame() {
    console.log("😀", this.network);

    if (!this.preloadComplete) return;

    this.scene.start(SCENES.GAME, { network: this.network });
  }
}
