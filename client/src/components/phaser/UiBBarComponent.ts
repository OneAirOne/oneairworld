import Phaser from "phaser";
import { IComponent } from "services/Component.service";
import { SHARED_CONFIG } from "../../../../shared/shared.config";
import GAME_CONFIG from "client.config";
import { Player } from "characters";

const BAR_WIDHT = 25;
const BAR_HEIGHT = 4;

export class UiBarComponent implements IComponent {
  private _scene?: Phaser.Scene;
  private _gameObject!: Phaser.GameObjects.GameObject &
    Phaser.GameObjects.Components.Transform;
  private _graphics?: Phaser.GameObjects.Graphics;

  constructor(scene?: Phaser.Scene) {
    this._scene = scene;
  }

  init(
    go: Phaser.GameObjects.GameObject &
      Phaser.GameObjects.Components.Transform &
      Player
  ) {
    this._gameObject = go;

    // Remove the graphics when the followed game object is destroyed
    this._gameObject.once(Phaser.Scenes.Events.DESTROY, () => {
      this._graphics?.destroy();
    });
  }

  updateLifeBar(percent: number) {
    this._graphics?.clear();
    //
    this._graphics?.fillStyle(0xffffff);
    this._graphics?.lineStyle(1, 0x333333);
    this._graphics?.strokeRect(0, 0, BAR_WIDHT, BAR_HEIGHT);
    this._graphics?.fillRect(0, 0, BAR_WIDHT, BAR_HEIGHT);

    this._graphics?.fillStyle(0x7ddf64);
    this._graphics?.lineStyle(0.5, 0x333333);
    this._graphics?.strokeRect(0, 0, BAR_WIDHT * percent, BAR_HEIGHT);
    this._graphics?.fillRect(0, 0, BAR_WIDHT * percent, BAR_HEIGHT);
  }

  start() {
    const scene = this._scene ?? this._gameObject.scene;

    this._graphics = scene.add.graphics();
  }

  update(dt: number) {
    if (!this._graphics) return;

    const percent =
      this._gameObject instanceof Player ? this._gameObject.life / 100 : 1;

    this.updateLifeBar(percent);

    this._graphics.x = this._gameObject.x - BAR_WIDHT / 2;

    this._graphics.y = this._gameObject.y - SHARED_CONFIG.SPRITE_SIZE - 10;
    this._graphics;
  }
}
