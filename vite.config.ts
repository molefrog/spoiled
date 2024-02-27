/// <reference types="vitest" />

import { UserConfig, defineConfig, mergeConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

const buildLibraryConfig: UserConfig = {
  root: ".",

  plugins: [dts()],

  build: {
    lib: {
      entry: "src/Spoiler.tsx",
      formats: ["es"],
      fileName: "spoiled",
    },
    rollupOptions: {
      external: ["react"],
    },
  },
};

const devConfig: UserConfig = {
  root: "demo",

  css: {
    transformer: "lightningcss",
  },

  test: {
    root: "src",
    environment: "happy-dom",
  },

  build: {
    target: "es2022",
  },

  plugins: [react()],
};

export default defineConfig((configEnv) => {
  if (process.env.BUNDLE_LIBRARY) {
    return mergeConfig(devConfig, buildLibraryConfig);
  }

  return devConfig;
});
