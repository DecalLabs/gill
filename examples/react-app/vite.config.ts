import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    // Buffer polyfill required for headless wallet adapters
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
  ],
  css: {
    postcss: "./postcss.config.js",
  },
  // Define global Buffer for headless wallet compatibility
  define: {
    global: "globalThis",
  },
});
