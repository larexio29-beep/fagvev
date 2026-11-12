import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  // Relative URLs also work below a GitHub Pages repository path.
  base: "./",
  plugins: [react()],
  test: { include: ["tests/*.test.ts"] },
});
