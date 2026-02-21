import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const M3U_PROXY_PATH = "/api/iptv-proxy";

/** Dev-only: proxy M3U/playlist requests to avoid CORS (IPTV servers often don't send CORS headers). */
function iptvProxyPlugin() {
  return {
    name: "iptv-proxy",
    configureServer(server: { middlewares: { use: (req: unknown, res: unknown, next: () => void) => void } }) {
      server.middlewares.use((req: { url?: string; method?: string }, res: { setHeader: (a: string, b: string) => void; statusCode: number; end: (s?: string) => void }, next: () => void) => {
        if (req.method !== "GET" || !req.url?.startsWith(M3U_PROXY_PATH)) {
          next();
          return;
        }
        const q = req.url.indexOf("?");
        const params = q === -1 ? null : new URLSearchParams(req.url.slice(q));
        const target = params?.get("url");
        if (!target) {
          res.setHeader("Content-Type", "text/plain");
          res.statusCode = 400;
          res.end("Missing url query");
          return;
        }
        fetch(target, { signal: AbortSignal.timeout(15000) })
          .then((r) => {
            if (!r.ok) throw new Error(`Upstream ${r.status}`);
            return r.text();
          })
          .then((text) => {
            res.setHeader("Content-Type", "audio/mpegurl");
            res.setHeader("Cache-Control", "no-store");
            res.statusCode = 200;
            res.end(text);
          })
          .catch((e) => {
            res.setHeader("Content-Type", "text/plain");
            res.statusCode = 502;
            res.end(String(e?.message ?? "Proxy error"));
          });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && iptvProxyPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
