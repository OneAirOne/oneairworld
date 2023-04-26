import Phaser from "phaser";

export const gameEvents = new Phaser.Events.EventEmitter();

export enum Events {
  PLAYER_JOINED = "player-joined",
  PLAYER_UPDATED = "player-updated",
  PLAYER_LEFT = "player-left",
  PLAYER_DISCONNECTED = "player-disconnected",
}
