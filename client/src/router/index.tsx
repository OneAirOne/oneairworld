import { createBrowserRouter } from "react-router-dom";

import GameView from "features/game/game.view";
import AboutView from "features/about/about.view";
import ProjectView from "features/projects/project.view";
import SamuraiBallView from "features/projects/SamuraiBallView";

export enum ROUTES {
  GAME = "/",
  ABOUT = "/about",
  PROJECT = "/projets/:id",
  SAMURAI_BALL = "/projets/samurai-ball",
}

const router = createBrowserRouter([
  {
    path: ROUTES.GAME,
    element: <GameView />,
  },
  {
    path: ROUTES.ABOUT,
    element: <AboutView />,
  },
  {
    path: ROUTES.SAMURAI_BALL,
    element: <SamuraiBallView />,
  },
  {
    path: ROUTES.PROJECT,
    element: <ProjectView />,
  },
]);

export default router;
