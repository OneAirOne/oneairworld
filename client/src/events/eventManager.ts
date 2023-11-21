import Phaser from "phaser";

export const phaserEvents = new Phaser.Events.EventEmitter();

export enum PhaserEvent {
  MY_PLAYER_JOINED = "my-player-joined",
  PLAYER_JOINED = "player-joined",
  PLAYER_UPDATED = "player-updated",
  REMOTE_REF = "remote-ref",
  PLAYER_LEFT = "player-left",
  PLAYER_DISCONNECTED = "player-disconnected",
}
