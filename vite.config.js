import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import environment from "vite-plugin-environment";

const ii_url =
  process.env.DFX_NETWORK === "local"
    ? `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8081/`
    : `https://identity.internetcomputer.org/`;

process.env.II_URL = process.env.II_URL || ii_url;


export default defineConfig({
  logLevel: "error",

  build: {
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
  },

  css: {
    postcss: "./postcss.config.js",
  },

  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },

  server: {
    host: "0.0.0.0",
    port: 5173,

    allowedHosts: [
      "babiesiq.tech",
      "www.babiesiq.tech",
      "api.babiesiq.tech",
      "babyapi.pro",
      "www.babyapi.pro",
      "localhost",
      "127.0.0.1",
      "yt.protech.eu.org",
    ],

    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },

  plugins: [
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    environment(["II_URL"]),
    react(),
  ],

  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations", import.meta.url)
        ),
      },
      {
        find: "@",
        replacement: fileURLToPath(
          new URL("./src", import.meta.url)
        ),
      },
    ],

    dedupe: ["@dfinity/agent"],
  },
});
