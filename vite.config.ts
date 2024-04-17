/// <reference types="vitest" />

import { UserConfig, defineConfig, mergeConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import preserveDirectives from "rollup-preserve-directives";

const injectCompiledCSS: Plugin = {
  name: "inject-css",
  enforce: "post", // Ensure this runs after Vite's internal CSS handling

  generateBundle(_options, bundle) {
    let css = "";

    Object.values(bundle).forEach((file) => {
      if (file.fileName.endsWith(".css") && file.type === "asset") {
        css += file.source.toString();
      }
    });

    const source = Object.values(bundle).find((file) => {
      return file.type === "chunk" && file.fileName.endsWith("index.js");
    })!;

    if (source.type === "chunk") {
      source.code = source.code.replace(`"INLINED_CSS_GOES_HERE"`, JSON.stringify(css));
    }
  },
};

const buildLibraryConfig: UserConfig = {
  root: ".",

  plugins: [dts({ rollupTypes: true }), preserveDirectives(), injectCompiledCSS],

  build: {
    outDir: "esm",
    lib: {
      entry: ["src/index.ts", "src/index_unstyled.ts"],
      formats: ["es"],
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
