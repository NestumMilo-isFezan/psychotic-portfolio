import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import devServer from "@hono/vite-dev-server";
import sitemap from "vite-plugin-sitemap";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const siteUrl = env.VITE_SITE_URL || "https://your-domain.com";

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      react(),
      devServer({
        entry: "src/server/index.ts",
        exclude: [
          /^\/(?!api\/).*/, // Exclude everything that doesn't start with /api/
          /^\/api\/.*\/static\/.*/,
        ],
      }),
      sitemap({
        hostname: siteUrl,
        generateRobotsTxt: true,
      }),
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react")) return "vendor-react";
              if (id.includes("motion")) return "vendor-motion";
              if (id.includes("lucide") || id.includes("react-icons")) return "vendor-icons";
              return "vendor-utils";
            }
          },
        },
        onwarn(warning, warn) {
          if (warning.code === "COMMONJS_VARIABLE_IN_ESM") return;
          warn(warning);
        },
      },
    },
  };
});
