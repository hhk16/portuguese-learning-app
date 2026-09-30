import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const serverPort = Number(process.env.PP_SERVER_PORT ?? 8787);

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/ws": { target: `ws://localhost:${serverPort}`, ws: true },
      "/api": { target: `http://localhost:${serverPort}` },
    },
  },
  build: { target: "es2022", chunkSizeWarningLimit: 2000 },
});
