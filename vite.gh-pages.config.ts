import solid from "solid-start/vite";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/pre-lf-loadouts/",
  plugins: [
    solid({ ssr: false }),
  ],
});
