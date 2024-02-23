/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    root: "src",
    environment: "happy-dom",
  },

  plugins: [react()],

  root: "demo",
  css: {
    transformer: "lightningcss",
  },
});
