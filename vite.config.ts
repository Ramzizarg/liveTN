import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import http from "http";
import https from "https";
import { URL } from "url";

const M3U_PROXY_PATH = "/api/iptv-proxy";
const STREAM_PROXY_PATH = "/api/stream-proxy";

/** Dev-only: proxy M3U/playlist and video stream requests to avoid CORS. */
function iptvProxyPlugin() {
  return {
    name: "iptv-proxy",
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: { url?: string; method?: string }, res: { setHeader: (a: string, b: string) => void; statusCode: number; write: (data: Buffer) => void; end: (s?: string | Buffer) => void }, next: () => void) => {
        if (req.method !== "GET") {
          next();
          return;
        }

        // Handle stream proxy (/api/stream-proxy)
        if (req.url?.startsWith(STREAM_PROXY_PATH)) {
          const q = req.url.indexOf("?");
          const params = q === -1 ? null : new URLSearchParams(req.url.slice(q));
          const target = params?.get("url");
          if (!target) {
            res.setHeader("Content-Type", "text/plain");
            res.statusCode = 400;
            res.end("Missing url query");
            return;
          }
          
          console.log("[Proxy] Stream:", target);
          
          // Fetch with redirect following (native fetch handles this)
          // No timeout for live streams - they never end
          fetch(target, { 
            headers: {
              "User-Agent": "VLC/3.0.18 LibVLC/3.0.18",
              Accept: "*/*",
              "Accept-Encoding": "identity",
              Connection: "keep-alive",
            }
          })
            .then((fetchRes) => {
              if (!fetchRes.ok) {
                throw new Error(`HTTP ${fetchRes.status}`);
              }
              
              const contentType = fetchRes.headers.get("content-type");
              
              // Set CORS headers
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
              res.setHeader("Access-Control-Expose-Headers", "*");
              res.setHeader("Content-Type", contentType || "application/octet-stream");
              res.setHeader("Cache-Control", "no-cache");
              
              // Copy other headers
              const contentLength = fetchRes.headers.get("content-length");
              if (contentLength) {
                res.setHeader("Content-Length", contentLength);
              }
              
              res.statusCode = 200;
              
              // For m3u8 playlists, rewrite URLs
              if (contentType?.includes("mpegurl") || target.includes(".m3u8")) {
                fetchRes.text().then(text => {
                  // Rewrite URLs in playlist to go through proxy
                  const rewritten = text.replace(/(https?:\/\/[^\s\r\n]+)/g, (match) => {
                    return `/api/stream-proxy?url=${encodeURIComponent(match)}`;
                  });
                  res.end(rewritten);
                }).catch(err => {
                  console.error("[Proxy] Error reading playlist:", err);
                  res.statusCode = 502;
                  res.end("Error reading playlist");
                });
                return;
              }
              
              // For video streams (.ts), pipe directly without buffering
              if (fetchRes.body) {
                const reader = fetchRes.body.getReader();
                
                function pump() {
                  reader.read().then(({ done, value }) => {
                    if (done) {
                      res.end();
                      return;
                    }
                    res.write(Buffer.from(value));
                    pump();
                  }).catch(err => {
                    console.error("[Proxy] Stream error:", err);
                    res.end();
                  });
                }
                
                pump();
              } else {
                res.end();
              }
            })
            .catch((e) => {
              console.error("[Proxy] Error:", e.message);
              res.setHeader("Content-Type", "text/plain");
              res.statusCode = 502;
              res.end(String(e?.message ?? "Proxy error"));
            });
          return;
        }

        // Handle M3U proxy (/api/iptv-proxy)
        if (!req.url?.startsWith(M3U_PROXY_PATH)) {
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
        console.log("[Proxy] M3U:", target);
        // Use original URL - let server handle redirects
        const fixedTarget = target;
        
        // Use native http module for better compatibility
        console.log("[Proxy] M3U connecting to:", fixedTarget);
        const urlObj = new URL(fixedTarget);
        console.log("[Proxy] M3U parsed:", urlObj.hostname, urlObj.port, urlObj.pathname + urlObj.search);
        const client = urlObj.protocol === "https:" ? https : http;
        const port = urlObj.port ? parseInt(urlObj.port) : (urlObj.protocol === "https:" ? 443 : 80);
        
        // Create agent with specific settings
        const agent = new client.Agent({
          keepAlive: true,
          keepAliveMsecs: 1000,
          maxSockets: 5,
        });
        
        const requestOptions = {
          hostname: urlObj.hostname,
          port: port,
          path: urlObj.pathname + urlObj.search,
          method: "GET",
          agent: agent,
          headers: {
            "User-Agent": "VLC/3.0.18 LibVLC/3.0.18",
            Accept: "*/*",
            Referer: `${urlObj.protocol}//${urlObj.hostname}:8000/`,
            Connection: "keep-alive",
          },
        };
        
        console.log("[Proxy] M3U request options:", JSON.stringify(requestOptions));
        
        const proxyReq = client.request(requestOptions, (proxyRes) => {
          console.log("[Proxy] M3U response status:", proxyRes.statusCode);
          if (proxyRes.statusCode !== 200) {
            res.statusCode = 502;
            res.end(`Upstream ${proxyRes.statusCode}`);
            return;
          }
          res.setHeader("Content-Type", "audio/mpegurl");
          res.setHeader("Cache-Control", "no-store");
          res.statusCode = 200;
          
          // Manual pipe to avoid TypeScript issues
          proxyRes.on("data", (chunk) => {
            res.write(chunk);
          });
          proxyRes.on("end", () => {
            console.log("[Proxy] M3U response ended");
            res.end();
          });
        });
        
        proxyReq.on("error", (err) => {
          console.error("[Proxy] M3U request error:", err.message, err);
          res.statusCode = 502;
          res.end(String(err.message));
        });
        
        proxyReq.on("socket", (socket) => {
          console.log("[Proxy] M3U socket created");
          socket.on("connect", () => {
            console.log("[Proxy] M3U socket connected");
          });
        });
        
        console.log("[Proxy] M3U sending request...");
        proxyReq.end();
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
    iptvProxyPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
