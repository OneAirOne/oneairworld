import { createBrowserRouter } from "react-router-dom";

import GameView from "features/game/game.view";
import AboutView from "features/about/about.view";

export enum ROUTES {
  GAME = "/",
  ABOUT = "/about",
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
]);

export default router;
