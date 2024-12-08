// @ts-nocheck
import Phaser from "phaser";
import { IComponent } from "services/Component.service";
import { SHARED_CONFIG } from "../../../../shared/shared.config";
import CLIENT_CONFIG from "client.config";
import { Player } from "characters";

const BAR_WIDHT = 25;
const BAR_HEIGHT = 4;
const BAR_DEPHT = 51;

export class DebugPlayer implements IComponent {
  private _scene?: Phaser.Scene;
  private _gameObject!: Phaser.GameObjects.GameObject &
    Phaser.GameObjects.Components.Transform;
  private _graphics?: Phaser.GameObjects.Graphics;
  _debugFPS: Phaser.GameObjects.Text | null = null;
  _debugPlayer: Phaser.GameObjects.Text | null = null;

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
      this._debugFPS?.destroy();
      this._debugPlayer?.destroy();
    });
    const scene = this._scene ?? this._gameObject.scene;
  }

  updateFPS() {
    if (this._debugFPS) {
      this._debugFPS.text = `Frame rate: ${this._gameObject.scene.game.loop.actualFps.toFixed(
        2
      )}`;
    }
  }

  updatePlayerPosition() {
    if (this._gameObject?.scene?.lastServerX) {
      this._debugPlayer.text = `
Player ID : ${this._gameObject?.id}
ServerX ${this._gameObject.scene.lastServerX.toFixed(
        2
      )}, ClientX ${this._gameObject.x.toFixed(2)}
ServerY ${this._gameObject.scene.lastServerY.toFixed()} ClientY ${this._gameObject.y.toFixed(
        2
      )}
`;
    }
  }

  start() {
    this._debugPlayer = this._scene.add.text(window.innerWidth - 320, 10, "", {
      fontSize: "15px",
      padding: { x: 10, y: 0 },
      backgroundColor: "#000000",
      color: "#ffffff",
    });

    this._debugFPS = this._scene.add.text(
      window.innerWidth - 210,
      window.innerHeight - 50,
      "",
      {
        fontSize: "15px",
        padding: { x: 10, y: 5 },
        backgroundColor: "#000000",
        color: "#ffffff",
      }
    );
  }

  update(dt: number) {
    if (!this._debugFPS && !this._debugPlayer) {
      return;
    }

    this.updateFPS();
    this.updatePlayerPosition();
  }
}
