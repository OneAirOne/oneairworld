// Components
import { StartGame } from "./components/startGame.component";
import { CvPopup } from "./components/CvPopup";
import { GameOverScreen } from "./components/GameOverScreen";
import { ProjectOverlay } from "./components/ProjectOverlay";
import { ExitButton } from "./components/ExitButton";

export default function GameView() {
  return (
    <>
      <StartGame />
      <ExitButton />
      <CvPopup />
      <GameOverScreen />
      <ProjectOverlay />
    </>
  );
}
