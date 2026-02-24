/**
 * IPTV M3U Proxy - Proxies M3U playlist requests to bypass CORS
 * Usage: /api/iptv-proxy?url=http://s4.360iptv.net:8000/get.php?username=xxx&password=xxx
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
      },
    });

    if (!fetchResponse.ok) {
      res.status(502).json({ error: `Upstream error: ${fetchResponse.status}` });
      return;
    }

    const text = await fetchResponse.text();

    res.setHeader("Content-Type", "audio/mpegurl");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    const encoder = new TextEncoder();
    res.status(200).write(encoder.encode(text));
    res.status(200).end();
  } catch (error) {
    console.error("M3U proxy error:", error);
    const message = error instanceof Error ? error.message : "Proxy error";
    res.status(502).json({ error: message });
  }
}
