import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/tumbleweed/",
  build: {
    outDir: "dist/tumbleweed",
    emptyOutDir: true,
  },
  server: {
    port: 5273,
    host: true,
  },
}));
