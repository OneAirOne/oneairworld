import phaserGame from "Game";

// Components
import { StartGame } from "./components/startGame.component";

export default function GameView() {
  const game = phaserGame.scene.keys.game;
  return <StartGame />;
}
