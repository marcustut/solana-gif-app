import { defineConfig } from "vite";
import inject from "@rollup/plugin-inject";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: {},
    process: {
      env: {},
    },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      plugins: [inject({ Buffer: ["buffer", "Buffer"] })],
    },
  },
});
