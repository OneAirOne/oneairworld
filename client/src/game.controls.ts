import Phaser from "phaser";

export default class Controls {
  // private enabled: boolean = false;
  // private scene!: Phaser.Scene;
  // private keyboard!: Phaser.Types.Input.Keyboard.CursorKeys;
  // private key: object;
  // constructor(scene: Phaser.Scene) {
  //   this.enabled = true;
  //   this.scene = scene;
  //   this.scene = this.scene.input.keyboard.createCursorKeys();
  //   this.key = this.scene.input.keyboard.addKeys({
  //     shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
  //     up: Phaser.Input.Keyboard.KeyCodes.UP,
  //     right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
  //     down: Phaser.Input.Keyboard.KeyCodes.DOWN,
  //     left: Phaser.Input.Keyboard.KeyCodes.LEFT,
  //     space: Phaser.Input.Keyboard.KeyCodes.SPACE,
  //     tab: Phaser.Input.Keyboard.KeyCodes.TAB,
  //     ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
  //     X: Phaser.Input.Keyboard.KeyCodes.X,
  //     One: Phaser.Input.Keyboard.KeyCodes.ONE,
  //     Two: Phaser.Input.Keyboard.KeyCodes.TWO,
  //     F: Phaser.Input.Keyboard.KeyCodes.F,
  //     C: Phaser.Input.Keyboard.KeyCodes.C,
  //     W: Phaser.Input.Keyboard.KeyCodes.W,
  //     M: Phaser.Input.Keyboard.KeyCodes.M,
  //     I: Phaser.Input.Keyboard.KeyCodes.I,
  //     A: Phaser.Input.Keyboard.KeyCodes.A,
  //     S: Phaser.Input.Keyboard.KeyCodes.S,
  //     D: Phaser.Input.Keyboard.KeyCodes.D,
  //     E: Phaser.Input.Keyboard.KeyCodes.E,
  //     Enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
  //   });
  //   this.emitKeybordDownEvent();
  //   this.emitKeyboardReleaseEvent();
  // }
  // emitKeybordDownEvent() {
  //   // TODO: add debounce
  //   if (this.scene) {
  //     this.scene.events.on("update", () => {
  //       if (this.keyboard.shift.isDown) {
  //         console.log("shift down");
  //       }
  //       if (this.keyboard.up.isDown && !this.keyboard.down.isDown) {
  //       }
  //       if (this.keyboard.down.isDown && !this.keyboard.up.isDown) {
  //       }
  //       if (this.keyboard.right.isDown && !this.keyboard.left.isDown) {
  //       }
  //       if (this.keyboard.left.isDown && !this.keyboard.right.isDown) {
  //       }
  //       if (this.keyboard.space.isDown) {
  //       }
  //     });
  //   }
  // }
  // emitKeyboardReleaseEvent() {
  //   if (this.key) {
  //     this.key.up.on("up", () => {
  //       if (this.scene.id) {
  //         store.dispatch(actions[`MOVE_UP_RELEASE`]({ id: this.scene.id }));
  //       }
  //     });
  //     this.key.right.on("up", () => {
  //       if (this.scene.id) {
  //         store.dispatch(actions[`MOVE_RIGHT_RELEASE`]({ id: this.scene.id }));
  //       }
  //     });
  //     this.key.down.on("up", () => {
  //       if (this.scene.id) {
  //         store.dispatch(actions[`MOVE_DOWN_RELEASE`]({ id: this.scene.id }));
  //       }
  //     });
  //     this.key.left.on("up", () => {
  //       if (this.scene.id) {
  //         store.dispatch(actions[`MOVE_LEFT_RELEASE`]({ id: this.scene.id }));
  //       }
  //     });
  //     this.key.space.on("up", () => {
  //       if (this.scene.id) {
  //         store.dispatch(actions[`ATTACK_RELEASE`]({ id: this.scene.id }));
  //       }
  //     });
  //     this.key.shift.on("up", () => {
  //       if (this.scene.id) {
  //         store.dispatch(actions[`SPEED_RELEASE`]({ id: this.scene.id }));
  //       }
  //     });
  //   }
  // }
}
