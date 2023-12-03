import * as React from "react";

// MUI
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Components
import LaunchButton from "./lauchButton";

// Others
import phaserGame from "Game";
import { BootScene, SCENES } from "scenes";

// Shared
import { Characters } from "../../../../../shared/types";

export function StartGame() {
  const [isStarted, setIsStarted] = React.useState(false);
  const mail = "gilberterwan@gmail.com";

  const handlLauchGame = React.useCallback(async () => {
    try {
      const bootScene = phaserGame.scene.keys[SCENES.BOOT] as BootScene;

      bootScene.launchGame();

      await bootScene.network.joinOrCreatePublic({
        name: "Erwan",
        texture: Characters.ONEAIR,
      });
    } catch (error) {
      console.error(error);
    }
    setIsStarted(true);
  }, []);

  return (
    <React.Fragment>
      {!isStarted && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "hsl(0, 0%, 98%) ",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box sx={{ maxWidth: "40%" }}>
            <Box
              id="wrapper-30"
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                outlineOffset: "4px",
              }}
            >
              <Box sx={{ marginBottom: 2 }}>
                <img src="assets/avatar-opacity.gif" />
              </Box>

              <Box sx={{ marginBottom: 6 }}>
                <Typography variant="h3" paragraph>
                  Hi,
                </Typography>
                <Typography variant="h6" paragraph>
                  I'm Erwan a french software developper. I really enjoy working
                  on digital projects, especially immervsive experiences like
                  gaming.
                </Typography>

                <Typography variant="h6" paragraph>
                  {`Do not hesitate to contact me for any requests of informations
                  or project requests at `}
                  <a
                    href={`mailto:${mail}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {mail}
                  </a>
                </Typography>

                <Typography variant="h6">
                  If you want to see what I'm capable of or just kill some
                  aliens, click on the button 🤭
                </Typography>
              </Box>

              <LaunchButton onClick={handlLauchGame} />
            </Box>
          </Box>
        </Box>
      )}
    </React.Fragment>
  );
}
