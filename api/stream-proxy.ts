/**
 * Stream Proxy - Proxies HLS video streams (.m3u8, .ts) to bypass CORS
 * Usage: /api/stream-proxy?url=http://s4.360iptv.net:8000/live/xxx/xxx/xxx.m3u8
 */

export default async function handler(req: { method?: string; query?: { url?: string } }, res: { setHeader: (key: string, value: string) => void; status: (code: number) => { json: (data: unknown) => void; end: () => void; write: (data: Uint8Array) => void } }) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const url = req.query?.url;

  if (!url || !url.startsWith("http")) {
    res.status(400).json({ error: "Missing or invalid url parameter" });
    return;
  }

  try {
    const fetchResponse = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "VLC/3.0.18 LibVLC/3.0.18",
        Accept: "*/*",
        "Accept-Encoding": "identity",
        Connection: "keep-alive",
      },
    });

    if (!fetchResponse.ok) {
      res.status(502).json({ error: `Upstream error: ${fetchResponse.status}` });
      return;
    }

    const contentType = fetchResponse.headers.get("content-type");

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Expose-Headers", "*");
    res.setHeader("Content-Type", contentType || "application/octet-stream");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    // For m3u8 playlists, rewrite URLs
    if (contentType?.includes("mpegurl") || url.includes(".m3u8")) {
      const text = await fetchResponse.text();
      const rewritten = text.replace(/(https?:\/\/[^\s\r\n]+)/g, (match) => {
        return `/api/stream-proxy?url=${encodeURIComponent(match)}`;
      });
      const encoder = new TextEncoder();
      res.status(200).write(encoder.encode(rewritten));
      res.status(200).end();
      return;
    }

    // For video streams, pipe directly
    if (fetchResponse.body) {
      const reader = fetchResponse.body.getReader();
      
      async function pump() {
        const { done, value } = await reader.read();
        if (done) {
          res.status(200).end();
          return;
        }
        res.status(200).write(value);
        await pump();
      }
      
      await pump();
    } else {
      res.status(200).end();
    }
  } catch (error) {
    console.error("Stream proxy error:", error);
    const message = error instanceof Error ? error.message : "Proxy error";
    res.status(502).json({ error: message });
  }
}
