import Phaser from "phaser";
import { SCENES } from "./scene.config";
import { INTERIORS } from "./interior.config";
import { Network } from "../services/Network";
import { Zone } from "../../../shared/types";

const PLAYER_SPEED = 2;

interface InitData {
  zone: Zone;
  playerTexture: string;
  network: Network;
}

export class InteriorScene extends Phaser.Scene {
  private _zone!: Zone;
  private _playerTexture!: string;
  private _network!: Network;
  private _player!: Phaser.GameObjects.Sprite;
  private _cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super(SCENES.INTERIOR);
  }

  init(data: InitData) {
    this._zone = data.zone;
    this._playerTexture = data.playerTexture;
    this._network = data.network;
  }

  preload() {
    const config = INTERIORS[this._zone];
    if (!config) return;

    if (!this.cache.tilemap.has(config.mapKey)) {
      this.load.tilemapTiledJSON(config.mapKey, config.mapPath);
    }
    config.tilesets.forEach((ts) => {
      if (!this.textures.exists(ts.name)) {
        this.load.image(ts.name, ts.path);
      }
    });
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);

    const config = INTERIORS[this._zone];
    if (!config || !this.cache.tilemap.has(config.mapKey)) {
      this._createPlaceholder();
      return;
    }

    // --- Tilemap ---
    const map = this.make.tilemap({ key: config.mapKey });
    const tilesets = config.tilesets.map((ts) =>
      map.addTilesetImage(ts.name, ts.name)
    );
    map.layers.forEach((layerData) => {
      map.createLayer(layerData.name, tilesets as Phaser.Tilemaps.Tileset[]);
    });

    // --- Player sprite ---
    this._player = this.add
      .sprite(config.playerSpawn.x, config.playerSpawn.y, this._playerTexture)
      .setDepth(1);

    this.cameras.main.startFollow(this._player, true);
    this.cameras.main.setZoom(2);

    // --- Label ---
    if (config.label) {
      this.add
        .text(config.playerSpawn.x, config.playerSpawn.y - 40, config.label, {
          fontSize: "8px",
          color: "#ffffff99",
        })
        .setOrigin(0.5)
        .setDepth(2);
    }

    this._setupControls();
  }

  private _createPlaceholder() {
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    this.add.rectangle(cx, cy, this.cameras.main.width, this.cameras.main.height, 0x0d0d1a);

    this.add
      .text(cx, cy - 20, INTERIORS[this._zone]?.label ?? "Interior", {
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 10, "[ESC] Exit", {
        fontSize: "9px",
        color: "#ffffff66",
      })
      .setOrigin(0.5);

    this._setupControls();
  }

  private _setupControls() {
    this._cursors = this.input.keyboard!.createCursorKeys();
    this.input.keyboard!.on("keydown-ESC", this._exit, this);
  }

  update() {
    if (!this._player || !this._cursors) return;

    let vx = 0;
    let vy = 0;
    if (this._cursors.left.isDown)  vx = -PLAYER_SPEED;
    if (this._cursors.right.isDown) vx =  PLAYER_SPEED;
    if (this._cursors.up.isDown)    vy = -PLAYER_SPEED;
    if (this._cursors.down.isDown)  vy =  PLAYER_SPEED;

    this._player.x += vx;
    this._player.y += vy;
  }

  private _exit() {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // Notify server: back on the road
      this._network?.setZone(Zone.ROAD);

      this.scene.resume(SCENES.GAME);
      this.scene.stop(SCENES.INTERIOR);
    });
  }
}
