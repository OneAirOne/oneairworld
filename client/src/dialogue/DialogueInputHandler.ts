import Phaser from "phaser";
import { phaserEvents, PhaserEvent } from "../events/eventManager";
import type { DialogueManager } from "./DialogueManager";

/**
 * Centralises keyboard + mobile dialogue controls for any scene.
 * Call register() in create() and unregister() when leaving the scene.
 *
 * @param onAction  Called for every DIALOGUE_ACTION emitted while registered.
 * @param onEsc     Called when ESC is pressed and no dialogue is open (optional).
 */
export class DialogueInputHandler {
  private _onMobileInteract: () => void;
  private _onMobileNavUp: () => void;
  private _onMobileNavDown: () => void;
  private _onMobileClose: () => void;
  private _onDialogueAction: (action: string) => void;

  constructor(
    private readonly _manager: DialogueManager,
    private readonly _onAction?: (action: string) => void,
    private readonly _onEsc?: () => void,
  ) {
    this._onMobileInteract = () => {
      if (this._manager.isOpen()) this._manager.confirm();
      else if (this._manager.isInZone()) this._manager.open();
    };
    this._onMobileNavUp   = () => { if (this._manager.isOpen()) this._manager.navigateUp(); };
    this._onMobileNavDown = () => { if (this._manager.isOpen()) this._manager.navigateDown(); };
    this._onMobileClose   = () => { if (this._manager.isOpen()) this._manager.close(); };
    this._onDialogueAction = (action: string) => this._onAction?.(action);
  }

  /** Attach keyboard listeners to the scene and global mobile listeners. */
  register(scene: Phaser.Scene) {
    scene.input.keyboard!.on("keydown-ENTER", () => {
      if (this._manager.isOpen()) this._manager.confirm();
      else if (this._manager.isInZone()) this._manager.open();
    });
    scene.input.keyboard!.on("keydown-UP",   () => { if (this._manager.isOpen()) this._manager.navigateUp(); });
    scene.input.keyboard!.on("keydown-DOWN", () => { if (this._manager.isOpen()) this._manager.navigateDown(); });
    scene.input.keyboard!.on("keydown-ESC",  () => {
      if (this._manager.isOpen()) this._manager.close();
      else this._onEsc?.();
    });

    phaserEvents.on(PhaserEvent.MOBILE_INTERACT,  this._onMobileInteract);
    phaserEvents.on(PhaserEvent.MOBILE_NAV_UP,    this._onMobileNavUp);
    phaserEvents.on(PhaserEvent.MOBILE_NAV_DOWN,  this._onMobileNavDown);
    phaserEvents.on(PhaserEvent.MOBILE_CLOSE,     this._onMobileClose);
    phaserEvents.on(PhaserEvent.DIALOGUE_ACTION,  this._onDialogueAction);
  }

  /** Remove global mobile listeners. Call when leaving the scene. */
  unregister() {
    phaserEvents.off(PhaserEvent.MOBILE_INTERACT,  this._onMobileInteract);
    phaserEvents.off(PhaserEvent.MOBILE_NAV_UP,    this._onMobileNavUp);
    phaserEvents.off(PhaserEvent.MOBILE_NAV_DOWN,  this._onMobileNavDown);
    phaserEvents.off(PhaserEvent.MOBILE_CLOSE,     this._onMobileClose);
    phaserEvents.off(PhaserEvent.DIALOGUE_ACTION,  this._onDialogueAction);
  }
}
