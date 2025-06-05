import { defineConfig, PluginOption } from "vite";
import tailwindcss from "@tailwindcss/vite";
import autoprefixer from "autoprefixer";
export default defineConfig({
  plugins: [tailwindcss(), autoprefixer() as any as PluginOption],
  server: {
    proxy: {
      "/api": "http://localhost:8080"
    }
  }
});
