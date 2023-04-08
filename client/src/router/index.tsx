import { createBrowserRouter } from "react-router-dom";

import HomeView from "features/home/home.view";
import GameView from "features/game/game.view";
import AboutView from "features/about/about.view";

export enum ROUTES {
  HOME = "/",
  GAME = "/game",
  ABOUT = "/about",
}

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <HomeView />,
  },
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
