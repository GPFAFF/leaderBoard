import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/leaderBoard/",
  test: {
    globals: true,
    include: ["scoring.test.js"],
  },
});
