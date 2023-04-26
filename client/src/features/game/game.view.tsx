import { Typography } from "@mui/material";
import phaserGame from "Game";

// Components
import StartGameDialog from "./components/startGameDialog.component";

export default function GameView() {
  const game = phaserGame.scene.keys.game;
  return <StartGameDialog />;
}
