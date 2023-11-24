import Phaser from "phaser";

interface Options {
  lastServerX: number;
  lastServerY: number;
  clientX: number;
  clientY: number;
}

export function updateDebug(debug: Phaser.GameObjects.Text, options: Options) {
  console.log(debug);
  debug.text = `
ServerX ${options.lastServerX.toFixed(2)}, ClientX ${options.clientX.toFixed(2)}
ServerY ${options.lastServerY.toFixed(2)} ClientY ${options.clientY.toFixed(
    2
  )}`;
}
