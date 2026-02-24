export interface Channel {
  id: string;
  name: string;
  logo: string;
  stream_url: string;
  category: string;
  country: string;
  is_live: boolean;
}

/** Arabic language channels - https://iptv-org.github.io/iptv/languages/ara.m3u */
export const ARA_M3U_URL = "https://iptv-org.github.io/iptv/languages/ara.m3u";

/** XCIPTV / Xtream Codes style defaults */
export const IPTV_PLAYLIST_NAME_DEFAULT = "Aziza";
export const IPTV_PORTAL_DEFAULT = "http://s4.360iptv.net:8000";
export const IPTV_USERNAME_DEFAULT = "691667172364";
export const IPTV_PASSWORD_DEFAULT = "691667172364";

/** Build stream URL like XCIPTV: portal/live/username/password/stream_id.ts */
export function buildXtreamStreamUrl(
  portal: string,
  username: string,
  password: string,
  streamId: string
): string {
  const base = portal.replace(/\/+$/, "");
  return `${base}/live/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${streamId}.ts`;
}

/** Build M3U playlist URL for Xtream Codes (get.php) –/** Builds the M3U playlist URL for Xtream Codes. */
export function buildXtreamM3uUrl(portal: string, username: string, password: string): string {
  const base = portal.trim().replace(/\/$/, "");
  // Use port 8080 which works for streams
  const baseWithPort = base.replace(":8000", ":8080");
  return `${baseWithPort}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus`;
}

const tn = (streamId: string) =>
  buildXtreamStreamUrl(IPTV_PORTAL_DEFAULT, IPTV_USERNAME_DEFAULT, IPTV_PASSWORD_DEFAULT, streamId);

export const channels: Channel[] = [
  // ── Tunisia (Xtream Codes – use Portal / Username / Password on site) ─
  {
    id: "tunisia-nat-1",
    name: "Tunisia Nat 1",
    logo: "https://thumbs2.imgbox.com/32/4e/aD3SFP6P_t.png",
    stream_url: tn("277964"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "tunisia-nat-1hd",
    name: "Tunisia Nat 1HD",
    logo: "https://thumbs2.imgbox.com/32/4e/aD3SFP6P_t.png",
    stream_url: tn("256266"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "tunisia-nat-1fhd",
    name: "Tunisia Nat 1FHD",
    logo: "https://thumbs2.imgbox.com/32/4e/aD3SFP6P_t.png",
    stream_url: tn("256264"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "tunisia-nat-2",
    name: "Tunisia Nat 2",
    logo: "https://thumbs2.imgbox.com/4b/ae/TLuCGVCc_t.jpg",
    stream_url: tn("256262"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "tunisia-nat-2-hd",
    name: "Tunisia Nat 2 HD",
    logo: "https://thumbs2.imgbox.com/4b/ae/TLuCGVCc_t.jpg",
    stream_url: tn("256267"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "tunisia-nat-2-fhd",
    name: "Tunisia Nat 2 FHD",
    logo: "https://thumbs2.imgbox.com/4b/ae/TLuCGVCc_t.jpg",
    stream_url: tn("256265"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "carthage-plus",
    name: "Carthage +",
    logo: "https://s12.gifyu.com/images/SVILc.png",
    stream_url: tn("256263"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "nessma-el-jadida",
    name: "NESSMA EL JADIDA",
    logo: "https://s12.gifyu.com/images/SV7JP.png",
    stream_url: tn("256268"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "telvza-tv",
    name: "Telvza TV",
    logo: "https://s12.gifyu.com/images/SV7eJ.png",
    stream_url: tn("256269"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "zaytoona",
    name: "Zaytoona",
    logo: "https://thumbs2.imgbox.com/e0/f6/TIvN83dl_t.png",
    stream_url: tn("256270"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "tunisna",
    name: "Tunisna",
    logo: "https://thumbs2.imgbox.com/fb/f7/9h8tNPXu_t.jpg",
    stream_url: tn("256271"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "janoubia",
    name: "janoubia",
    logo: "https://thumbs2.imgbox.com/1b/a2/VaJ24eK9_t.png",
    stream_url: tn("256272"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "tunisia-educ-1",
    name: "Tunisia Educ 1",
    logo: "https://thumbs2.imgbox.com/d8/c1/uedBP1Z8_t.png",
    stream_url: tn("256273"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "hannibal",
    name: "Hannibal",
    logo: "https://s9.gifyu.com/images/SVIpp.png",
    stream_url: tn("256274"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "al-hiwar-al-tunisi",
    name: "Al Hiwar Al tunisi",
    logo: "https://s12.gifyu.com/images/SV7PF.png",
    stream_url: tn("256275"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "al-insen",
    name: "Al Insen",
    logo: "https://i.imgur.com/PPnCEfE.png",
    stream_url: tn("256276"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "attessia-tv",
    name: "ATTESSIA TV",
    logo: "https://s12.gifyu.com/images/SV7en.png",
    stream_url: tn("256277"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "jawhara-fm-tv",
    name: "Jawhara FM-TV",
    logo: "https://thumbs2.imgbox.com/66/6e/IcINUcJP_t.jpg",
    stream_url: tn("256278"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "watania-2",
    name: "WATANIA 2",
    logo: "https://s12.gifyu.com/images/SV7Jx.png",
    stream_url: tn("256279"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },
  {
    id: "attessia-tv-2",
    name: "ATTESSIA TV (2)",
    logo: "https://s12.gifyu.com/images/SV7en.png",
    stream_url: tn("261887"),
    category: "Tunisia",
    country: "TN",
    is_live: true,
  },

  // ── Al Kass Sport – Qatar ─────────────────────────────────────────
  {
    id: "alkass-one",
    name: "Alkass One",
    logo: "https://i.imgur.com/10mmlha.png",
    stream_url: "https://liveeu-gcp.alkassdigital.net/alkass1-p/main.m3u8",
    category: "Sports",
    country: "QA",
    is_live: true,
  },
  {
    id: "alkass-two",
    name: "Alkass Two",
    logo: "https://i.imgur.com/8w61kFX.png",
    stream_url: "https://Streamer3.qna.org.qa:443/148164528_live/148164528_296.sdp/playlist.m3u8",
    category: "Sports",
    country: "QA",
    is_live: true,
  },
  {
    id: "alkass-three",
    name: "Alkass Three",
    logo: "https://i.imgur.com/d57BdFh.png",
    stream_url: "https://liveeu-gcp.alkassdigital.net/alkass3-p/main.m3u8",
    category: "Sports",
    country: "QA",
    is_live: true,
  },
  {
    id: "alkass-four",
    name: "Alkass Four",
    logo: "https://i.imgur.com/iDL65Wu.png",
    stream_url: "https://liveeu-gcp.alkassdigital.net/alkass4-p/main.m3u8",
    category: "Sports",
    country: "QA",
    is_live: true,
  },
  {
    id: "alkass-five",
    name: "Alkass Five",
    logo: "https://i.imgur.com/6RGNGsM.png",
    stream_url: "https://liveeu-gcp.alkassdigital.net/alkass5-p/main.m3u8",
    category: "Sports",
    country: "QA",
    is_live: true,
  },
  {
    id: "alkass-six",
    name: "Alkass Six",
    logo: "https://i.imgur.com/CrPSPSC.png",
    stream_url: "https://liveeu-gcp.alkassdigital.net/alkass6-p/main.m3u8",
    category: "Sports",
    country: "QA",
    is_live: true,
  },
  {
    id: "alkass-seven",
    name: "Alkass Seven",
    logo: "https://i.imgur.com/3eyHP3S.png",
    stream_url: "https://liveeu-gcp.alkassdigital.net/alkass7-p/main.m3u8",
    category: "Sports",
    country: "QA",
    is_live: true,
  }
];

/** Map Tunisia channel id → stream ID (for rebuilding URL when user changes IPTV code on site) */
export const TUNISIA_STREAM_IDS: Record<string, string> = Object.fromEntries(
  channels
    .filter((c) => c.country === "TN")
    .map((c) => {
      const parts = c.stream_url.split("/");
      const last = parts[parts.length - 1] ?? "";
      return [c.id, last.replace(/\.ts$/, "")];
    })
);

// M3U Parser (optionally resolve relative stream URLs against baseUrl)
export function parseM3U(content: string, baseUrl?: string): Channel[] {
  const lines = content.split(/\r?\n/);
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      currentChannel = { is_live: true };

      const nameMatch = line.match(/,(.+)$/);
      if (nameMatch) currentChannel.name = nameMatch[1].trim();

      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      if (logoMatch) currentChannel.logo = logoMatch[1];

      const groupMatch = line.match(/group-title="([^"]+)"/);
      if (groupMatch) currentChannel.category = groupMatch[1];

      const idMatch = line.match(/tvg-id="([^"]+)"/);
      const name = currentChannel.name || '';
      currentChannel.id = idMatch
        ? idMatch[1].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-')
        : name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-');

      const countryMatch = line.match(/tvg-country="([^"]+)"/);
      if (countryMatch) {
        currentChannel.country = countryMatch[1].toUpperCase().slice(0, 2);
      } else {
        const group = (groupMatch?.[1] ?? "").toLowerCase();
        const nameLower = name.toLowerCase();
        const combined = `${group} ${nameLower}`;
        const qatarHint = /qatar|al\s*jazeera|الجزيرة|^qa\b/i;
        const arabicHint = /arabic|arab|عربي|العربية|beoutq|bein\s*sports/i;
        const tunisiaHint = /tunisia|tunisie|tunisian|^tn\b|الوطني|التونسية|تونس|nat\s*1|el\s*watania/i;
        if (qatarHint.test(combined)) currentChannel.country = "QA";
        else if (arabicHint.test(combined)) currentChannel.country = "AR";
        else if (tunisiaHint.test(combined)) currentChannel.country = "TN";
        else currentChannel.country = "UN";
      }
      if (!currentChannel.logo) currentChannel.logo = '';
    } else if (line && !line.startsWith('#') && currentChannel) {
      let streamUrl = line;
      if (baseUrl && !streamUrl.startsWith('http://') && !streamUrl.startsWith('https://')) {
        try {
          streamUrl = new URL(streamUrl, baseUrl).href;
        } catch {
          // keep as-is if resolution fails
        }
      }
      currentChannel.stream_url = streamUrl;
      if (currentChannel.name && currentChannel.stream_url) {
        const ch = currentChannel as Channel;
        if (!ch.logo) ch.logo = 'https://api.dicebear.com/7.x/identicon/svg?seed=' + encodeURIComponent(ch.id);
        if (!ch.category) ch.category = 'General';
        channels.push(ch);
      }
      currentChannel = null;
    }
  }

  return channels;
}

/** Strip userinfo (e.g. tvappapk@) from URL so fetch() can use it; auth stays in query string. */
function stripUrlCredentials(url: string): string {
  try {
    const u = new URL(url);
    if (u.username || u.password) {
      return `${u.protocol}//${u.host}${u.pathname}${u.search}`;
    }
    return url;
  } catch {
    return url;
  }
}

const M3U_FETCH_TIMEOUT_MS = 15_000;

/** In dev, use same-origin proxy to avoid CORS when IPTV server doesn't send Access-Control-Allow-Origin. */
function getM3UFetchUrl(url: string): string {
  const trimmed = url.trim();
  if (typeof window !== "undefined" && (trimmed.startsWith("http://") || trimmed.startsWith("https://"))) {
    // Use Vercel serverless function proxy (works in both dev and production)
    return `${window.location.origin}/api/iptv-proxy?url=${encodeURIComponent(trimmed)}`;
  }
  return stripUrlCredentials(trimmed);
}

/** Fetch M3U content from URL and return parsed channels. Base URL is used to resolve relative stream URLs. */
export async function fetchChannelsFromM3uUrl(url: string, timeoutMs = M3U_FETCH_TIMEOUT_MS): Promise<Channel[]> {
  const originalUrl = stripUrlCredentials(url.trim());
  const fetchUrl = getM3UFetchUrl(url);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(fetchUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const baseUrl = originalUrl.replace(/\?.*$/, "").replace(/\/[^/]*$/, "/");
    const list = parseM3U(text, baseUrl);
    return list;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error) {
      if (e.name === "AbortError") throw new Error("Connection timed out");
      throw e;
    }
    throw e;
  }
}

export type FetchM3uResult = { channels: Channel[]; failedCount: number };

/** Fetch multiple M3U URLs and merge channels (dedupe by id). Returns channels and count of URLs that failed. */
export async function fetchChannelsFromM3uUrls(urls: string[]): Promise<FetchM3uResult> {
  const seen = new Set<string>();
  const merged: Channel[] = [];
  let failedCount = 0;
  for (const url of urls) {
    const u = url.trim();
    if (!u) continue;
    try {
      const list = await fetchChannelsFromM3uUrl(u);
      for (const ch of list) {
        let id = ch.id;
        let n = 0;
        while (seen.has(id)) id = `${ch.id}-${++n}`;
        seen.add(id);
        merged.push({ ...ch, id });
      }
    } catch (e) {
      failedCount += 1;
      console.warn('M3U fetch failed:', u, e);
    }
  }
  return { channels: merged, failedCount };
}
