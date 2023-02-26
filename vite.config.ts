import solid from "solid-start/vite";
import { defineConfig } from "vite";
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  server: { https: true },
  plugins: [
    solid({ ssr: false }),
    basicSsl(),
  ],
});
