import Phaser from "phaser";
import { Player } from "../characters/player";
import { SERVER_DATA } from "client.config";
import type { IPlayer } from "../../../shared/types";
import { Anim } from "../../../shared/types";
import { phaserEvents, PhaserEvent } from "../events/eventManager";

export interface PlayerManagerOptions {
  /** Called when local player is created via handleJoin */
  onMyPlayerCreated?: (player: Player) => void;
  /** Called when a remote player is created via handleJoin */
  onOtherPlayerCreated?: (player: Player, sessionId: string) => void;
  /** Returns true if a player in given zone should be visible */
  isInCurrentZone: (zone: string) => boolean;
}

export class PlayerManager {
  private _players = new Map<string, Player>();
  private _myPlayer!: Player;

  constructor(
    private _scene: Phaser.Scene,
    private _getSessionId: () => string,
    private _options: PlayerManagerOptions,
  ) {}

  get myPlayer(): Player { return this._myPlayer; }
  get players(): Map<string, Player> { return this._players; }

  /** Inject a pre-created local player (e.g. Interior creates it before network fires) */
  setMyPlayer(player: Player) {
    this._myPlayer = player;
  }

  handleJoin(playerState: IPlayer, sessionId: string) {
    // Skip if already tracked
    if (sessionId === this._getSessionId() && this._myPlayer) return;
    if (this._players.has(sessionId)) return;

    const player = new Player(
      this._scene,
      playerState.x,
      playerState.y,
      playerState.texture,
      sessionId,
    );

    // Sync full server snapshot so the player appears in the right state immediately.
    // setData directly to bypass the switch fall-through in Player.update,
    // and always provide a valid anim (Colyseus schema may return "" before first onChange).
    player.setData(SERVER_DATA.X, playerState.x);
    player.setData(SERVER_DATA.Y, playerState.y);
    player.setData(SERVER_DATA.LIFE, playerState.life);
    const initialAnim = (playerState.anim as Anim) || Anim.IDDLE_DOWN;
    player.setData(SERVER_DATA.ANIM, initialAnim);
    player.updateAnim(initialAnim);
    if (playerState.isSpeaking) player.showSpeakingBubble();
    if (playerState.isDead) player.update(SERVER_DATA.IS_DEAD, true);

    if (sessionId === this._getSessionId()) {
      this._myPlayer = player;
      this._options.onMyPlayerCreated?.(player);
    } else {
      this._players.set(sessionId, player);
      this._options.onOtherPlayerCreated?.(player, sessionId);
    }

    this._myPlayer?.setDepth(this._players.size);
  }

  handleUpdate(field: string, value: number | string | boolean, id: string) {
    if (id === this._getSessionId() && this._myPlayer) {
      if (field === SERVER_DATA.HAS_SPEED_BOOST) {
        phaserEvents.emit(value ? PhaserEvent.SPEED_BOOST_START : PhaserEvent.SPEED_BOOST_END);
      }
      this._myPlayer.update(field, value);
      return;
    }

    const player = this._players.get(id);
    if (!player) return;

    if (field === SERVER_DATA.ZONE) {
      player.setVisible(this._options.isInCurrentZone(value as string));
      return;
    }

    player.update(field, value);
  }

  handleLeave(sessionId: string) {
    const player = this._players.get(sessionId);
    if (!player) return;
    player.destroy();
    this._players.delete(sessionId);
  }

  updateMyPlayer(onPositionUpdate?: (x: number, y: number) => void) {
    if (!this._myPlayer) return;

    const serverX    = this._myPlayer.getData(SERVER_DATA.X);
    const serverY    = this._myPlayer.getData(SERVER_DATA.Y);
    const serverAnim = this._myPlayer.getData(SERVER_DATA.ANIM);
    const serverLife = this._myPlayer.getData(SERVER_DATA.LIFE);

    if (serverX)         this._myPlayer.lerpPositionX(serverX);
    if (serverY)         this._myPlayer.lerpPositionY(serverY);
    if (serverAnim)      this._myPlayer.updateAnim(serverAnim);
    if (serverLife >= 0) this._myPlayer.updateLife(serverLife);

    onPositionUpdate?.(serverX, serverY);
  }

  updateOtherPlayers() {
    this._players.forEach((player) => {
      const serverX    = player.getData(SERVER_DATA.X);
      const serverY    = player.getData(SERVER_DATA.Y);
      const serverAnim = player.getData(SERVER_DATA.ANIM);
      const serverLife = player.getData(SERVER_DATA.LIFE);

      if (serverX)         player.lerpPositionX(serverX);
      if (serverY)         player.lerpPositionY(serverY);
      if (serverAnim)      player.updateAnim(serverAnim);
      if (serverLife >= 0) player.updateLife(serverLife);
    });
  }
}
