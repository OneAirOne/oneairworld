import { PaletteMode } from "@mui/material";
import {
  amber,
  deepOrange,
  grey,
  green,
  yellow,
  pink,
} from "@mui/material/colors";
import { ThemeOptions, createTheme } from "@mui/material/styles";

const getDesignTokens = (mode: PaletteMode) => ({
  typography: {
    fontFamily: ["Nunito"].join(","),
  },
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // palette values for light mode
          primary: amber,
          divider: amber[200],
          text: {
            primary: grey[900],
            secondary: grey[800],
          },
        }
      : {
          // palette values for dark mode
          primary: pink,
          divider: pink[200],
          background: {
            default: "#0C1821",
            paper: deepOrange[900],
          },
          text: {
            primary: "#fff",
            secondary: grey[500],
          },
        }),
  },
});

export const theme = (mode: PaletteMode) => createTheme(getDesignTokens(mode));
