import { PropsWithChildren } from "react";
import Stack from "@mui/material/Stack";

interface Props {}

export default function Layout({ children }: PropsWithChildren<Props>) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <Stack>{children}</Stack>
    </Stack>
  );
}
