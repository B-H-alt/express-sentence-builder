import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import type { Plugin } from "vite";

const offlineBuild = (): Plugin => ({
  name: "expressly-offline-build",
  apply: "build",
  enforce: "post",
  generateBundle(_options, bundle) {
    const template = readFileSync(path.resolve(__dirname, "scripts/offline-worker.js"), "utf8");
    const publicFiles = ["/handmade-logo.png", "/expressly-icon-192.png", "/expressly-icon-512.png", "/manifest.webmanifest"];
    const files = Object.keys(bundle).filter((file) => file === "index.html" || file.startsWith("assets/"));
    const hash = createHash("sha256").update(template);
    for (const file of publicFiles) hash.update(readFileSync(path.resolve(__dirname, `public${file}`)));
    const version = hash.update(files.map((file) => {
      const output = bundle[file];
      return file + (output.type === "chunk" ? output.code : String(output.source));
    }).join("\n")).digest("hex").slice(0, 16);
    const manifest = { version, urls: [...files.map((file) => `/${file}`), ...publicFiles] };
    this.emitFile({ type: "asset", fileName: "sw.js", source: template.replace("/* BUILD_MANIFEST */ null", JSON.stringify(manifest)) });
  },
});

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), offlineBuild()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
