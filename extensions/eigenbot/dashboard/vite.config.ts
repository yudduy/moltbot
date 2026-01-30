import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/eigenbot/dashboard/",
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/eigenbot/receipts": "http://localhost:18789",
      "/eigenbot/receipt": "http://localhost:18789",
      "/eigenbot/stats": "http://localhost:18789",
    },
  },
});
