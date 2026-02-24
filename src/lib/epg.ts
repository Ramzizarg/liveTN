/**
 * Fetch and parse Xtream Codes EPG (xmltv.php).
 * Format: http://portal/xmltv.php?username=X&password=Y
 */

export type Programme = {
  title: string;
  start: string; // ISO
  stop: string;
};

/** Programmes keyed by channel id (EPG channel id – often stream_id) */
export type EpgByChannel = Record<string, Programme[]>;

const EPG_FETCH_TIMEOUT_MS = 15_000;

function parseXmltvXml(xml: string): EpgByChannel {
  const byChannel: EpgByChannel = {};
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const programmes = doc.querySelectorAll("programme");
    programmes.forEach((prog) => {
      const channel = prog.getAttribute("channel")?.trim();
      const start = prog.getAttribute("start")?.trim();
      const stop = prog.getAttribute("stop")?.trim();
      const titleEl = prog.querySelector("title");
      const title = titleEl?.textContent?.trim() ?? "";
      if (!channel || !start) return;
      if (!byChannel[channel]) byChannel[channel] = [];
      byChannel[channel].push({ title, start, stop: stop ?? "" });
    });
    // Sort each channel's programmes by start time
    Object.keys(byChannel).forEach((ch) => {
      byChannel[ch].sort((a, b) => a.start.localeCompare(b.start));
    });
  } catch {
    // ignore parse errors
  }
  return byChannel;
}

/** Parse XMLTV date format (e.g. 20250220120000 +0000) to Date */
function parseXmltvTime(s: string): number {
  if (!s || s.length < 14) return 0;
  const digits = s.replace(/\D/g, "").slice(0, 14);
  if (digits.length < 14) return 0;
  const y = parseInt(digits.slice(0, 4), 10);
  const m = parseInt(digits.slice(4, 6), 10) - 1;
  const d = parseInt(digits.slice(6, 8), 10);
  const h = parseInt(digits.slice(8, 10), 10);
  const min = parseInt(digits.slice(10, 12), 10);
  const sec = parseInt(digits.slice(12, 14), 10);
  return new Date(y, m, d, h, min, sec).getTime();
}

export function getNowAndNext(programmes: Programme[] | undefined, nowMs: number): { now?: Programme; next?: Programme } {
  if (!programmes?.length) return {};
  const result: { now?: Programme; next?: Programme } = {};
  for (let i = 0; i < programmes.length; i++) {
    const p = programmes[i];
    const startMs = parseXmltvTime(p.start);
    const stopMs = p.stop ? parseXmltvTime(p.stop) : startMs + 3600000;
    if (nowMs >= startMs && nowMs < stopMs) result.now = p;
    if (nowMs < startMs && !result.next) {
      result.next = p;
      break;
    }
  }
  if (!result.next && programmes.length > 0) {
    const afterNow = programmes.filter((p) => parseXmltvTime(p.start) > nowMs);
    if (afterNow.length > 0) result.next = afterNow[0];
  }
  return result;
}

/** Route EPG through proxy to avoid CORS and Mixed Content issues. */
function getEpgFetchUrl(portal: string, username: string, password: string): string {
  const base = portal.replace(/\/+$/, "");
  const url = `${base}/xmltv.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
  if (typeof window !== "undefined" && (url.startsWith("http://") || url.startsWith("https://"))) {
    // Use Vercel serverless function proxy (works in both dev and production)
    return `${window.location.origin}/api/iptv-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export async function fetchEpg(portal: string, username: string, password: string): Promise<EpgByChannel> {
  const url = getEpgFetchUrl(portal, username, password);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EPG_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return {};
    const text = await res.text();
    return parseXmltvXml(text);
  } catch {
    clearTimeout(timeoutId);
    return {};
  }
}
