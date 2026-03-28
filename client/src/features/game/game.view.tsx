// Components
import { StartGame } from "./components/startGame.component";
import { CvPopup } from "./components/CvPopup";
import { GameOverScreen } from "./components/GameOverScreen";
import { ProjectOverlay } from "./components/ProjectOverlay";

export default function GameView() {
  return (
    <>
      <StartGame />
      <CvPopup />
      <GameOverScreen />
      <ProjectOverlay />
    </>
  );
}
