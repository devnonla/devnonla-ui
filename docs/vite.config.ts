import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const pagesBase = process.env.GITHUB_PAGES === "true" ? "/devnonla-ui/" : "/";

export default defineConfig({
  root: import.meta.dirname,
  base: pagesBase,
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: [
      {
        find: /^@nonla-agents\/ui$/,
        replacement: `${import.meta.dirname}/../src/index.ts`,
      },
      {
        find: "@nonla-agents/ui/styles.css",
        replacement: `${import.meta.dirname}/../src/styles.css`,
      },
    ],
  },
  server: {
    port: 5176,
    open: false,
    // The live-react sandbox frame has an opaque ("null") origin and loads modules cross-origin.
    cors: { origin: [/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/, "null"] },
    fs: {
      allow: [import.meta.dirname, `${import.meta.dirname}/..`],
    },
  },
});
