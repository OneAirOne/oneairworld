// Components
import { StartGame } from "./components/startGame.component";
import { CvPopup } from "./components/CvPopup.component";
import { GameOverScreen } from "./components/GameOverScreen.component";
import { ProjectOverlay } from "./components/ProjectOverlay.component";
import { ExitButton } from "./components/ExitButton.component";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";

export default function GameView() {
  return (
    <>
      <StartGame />
      <ExitButton />
      <LanguageSwitcher />
      <CvPopup />
      <GameOverScreen />
      <ProjectOverlay />
    </>
  );
}
