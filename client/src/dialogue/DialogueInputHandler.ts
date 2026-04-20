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
const STICK_NAV_COOLDOWN = 300; // ms between stick-triggered nav events
const STICK_DEAD = 0.5;

export class DialogueInputHandler {
  private _onMobileInteract: () => void;
  private _onMobileNavUp: () => void;
  private _onMobileNavDown: () => void;
  private _onMobileClose: () => void;
  private _onDialogueAction: (action: string) => void;
  private _lastStickNav = 0;

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

    // Gamepad: East button (Circle / B) → interact / confirm
    scene.input.gamepad?.on("down", (_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
      if (button.index === 1) { // index 1 = East (Circle / B)
        if (this._manager.isOpen()) this._manager.confirm();
        else if (this._manager.isInZone()) this._manager.open();
      }
      if (button.index === 13) { // D-pad up
        if (this._manager.isOpen()) this._manager.navigateUp();
      }
      if (button.index === 14) { // D-pad down
        if (this._manager.isOpen()) this._manager.navigateDown();
      }
    });

    phaserEvents.on(PhaserEvent.MOBILE_INTERACT,  this._onMobileInteract);
    phaserEvents.on(PhaserEvent.MOBILE_NAV_UP,    this._onMobileNavUp);
    phaserEvents.on(PhaserEvent.MOBILE_NAV_DOWN,  this._onMobileNavDown);
    phaserEvents.on(PhaserEvent.MOBILE_CLOSE,     this._onMobileClose);
    phaserEvents.on(PhaserEvent.DIALOGUE_ACTION,  this._onDialogueAction);
  }

  /** Poll gamepad stick for dialogue navigation. Call every frame from scene.update(). */
  update(scene: Phaser.Scene) {
    if (!this._manager.isOpen()) return;
    const pad = scene.input.gamepad?.getPad(0);
    if (!pad) return;

    const y = pad.leftStick.y;
    const now = Date.now();
    if (now - this._lastStickNav < STICK_NAV_COOLDOWN) return;

    if (y < -STICK_DEAD) {
      this._manager.navigateUp();
      this._lastStickNav = now;
    } else if (y > STICK_DEAD) {
      this._manager.navigateDown();
      this._lastStickNav = now;
    }
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
