import { Button, Divider, Stack, Typography } from "@mui/material";

import phaserGame from "Game";
import { BootScene, SCENES } from "scenes";

export default function StartGameDialog() {
  function startPublicGame() {
    const bootScene = phaserGame.scene.keys[SCENES.BOOT] as BootScene;
    bootScene.network.joinOrCreatePublic().then(() => {
      // TODO: dispatch in store
    });
  }
  return (
    <Stack
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        justifyContent: "space-evenly",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "background.default",
        borderRadius: 8,
        paddingX: 4,
        paddingTop: 6,
        paddingBottom: 8,
      }}
    >
      <Typography variant="h4" color="text.primary">
        Erwan Gilbert
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Venez découvrir mon portfolio interactif 🔥
      </Typography>

      <Divider
        variant="fullWidth"
        style={{ width: "100%" }}
        sx={{ height: 2, marginBottom: 3 }}
      />

      <Button
        variant="contained"
        color="primary"
        sx={{ marginBottom: 2 }}
        fullWidth
        onClick={startPublicGame}
      >
        Entrer
      </Button>
      <Button variant="contained" color="primary" fullWidth>
        Rejoindre une salle
      </Button>
    </Stack>
  );
}
