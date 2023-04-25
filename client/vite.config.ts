import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ViteTsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ViteTsconfigPaths()],
});
