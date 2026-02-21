import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  IPTV_PASSWORD_DEFAULT,
  IPTV_PORTAL_DEFAULT,
  IPTV_USERNAME_DEFAULT,
} from "@/data/channels";

const STORAGE_KEY = "livestream-tv-iptv-credentials";
const LEGACY_CODE_KEY = "livestream-tv-iptv-code";
const PLAYLIST_URL_KEY = "livestream-tv-playlist-url";

/** True if the string looks like a playlist or provider link (M3U / portal) */
export function isPlaylistUrl(s: string): boolean {
  const t = s.trim();
  return t.startsWith("http://") || t.startsWith("https://");
}

export type IptvCredentials = {
  portal: string;
  username: string;
  password: string;
};

const DEFAULT_CREDENTIALS: IptvCredentials = {
  portal: IPTV_PORTAL_DEFAULT,
  username: IPTV_USERNAME_DEFAULT,
  password: IPTV_PASSWORD_DEFAULT,
};

function loadStored(): IptvCredentials {
  if (typeof window === "undefined") return DEFAULT_CREDENTIALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<IptvCredentials>;
      return {
        portal: (parsed.portal ?? "").trim() || IPTV_PORTAL_DEFAULT,
        username: (parsed.username ?? "").trim() || IPTV_USERNAME_DEFAULT,
        password: (parsed.password ?? "").trim() || IPTV_PASSWORD_DEFAULT,
      };
    }
    const legacyCode = localStorage.getItem(LEGACY_CODE_KEY)?.trim();
    if (legacyCode) {
      const creds: IptvCredentials = {
        portal: IPTV_PORTAL_DEFAULT,
        username: IPTV_USERNAME_DEFAULT,
        password: legacyCode,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
      localStorage.removeItem(LEGACY_CODE_KEY);
      return creds;
    }
  } catch {
    // ignore
  }
  return DEFAULT_CREDENTIALS;
}

function credentialsEqual(a: IptvCredentials, b: IptvCredentials): boolean {
  return (
    a.portal === b.portal &&
    a.username === b.username &&
    a.password === b.password
  );
}

function loadSavedPlaylistUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const u = localStorage.getItem(PLAYLIST_URL_KEY)?.trim();
    return u || null;
  } catch {
    return null;
  }
}

type IptvCodeState = {
  /** XCIPTV-style: Portal URL, Username, Password */
  credentials: IptvCredentials;
  /** True if user has saved custom credentials (not default) */
  hasCustomCode: boolean;
  /** Saved M3U/playlist link – reload app or "Reload channels" to load from it */
  savedPlaylistUrl: string | null;
  setCredentials: (c: Partial<IptvCredentials>) => void;
  /** Set code (password for Tunisia) or playlist link. Link is stored; call loadFromM3uUrls in ChannelsContext to load. */
  setCodeOrLink: (value: string) => { isLink: boolean };
  setSavedPlaylistUrl: (url: string | null) => void;
  /** Clear saved credentials and playlist; use defaults */
  clearCredentials: () => void;
};

const IptvCodeContext = createContext<IptvCodeState | null>(null);

export function IptvCodeProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentialsState] = useState<IptvCredentials>(loadStored);
  const [hasCustomCode, setHasCustomCode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !credentialsEqual(loadStored(), DEFAULT_CREDENTIALS);
  });
  const [savedPlaylistUrl, setSavedPlaylistUrlState] = useState<string | null>(loadSavedPlaylistUrl);

  useEffect(() => {
    const stored = loadStored();
    setCredentialsState(stored);
    setHasCustomCode(!credentialsEqual(stored, DEFAULT_CREDENTIALS));
    setSavedPlaylistUrlState(loadSavedPlaylistUrl());
  }, []);

  const setCredentials = useCallback((c: Partial<IptvCredentials>) => {
    setCredentialsState((prev) => {
      const next: IptvCredentials = {
        portal: (c.portal ?? prev.portal).trim() || IPTV_PORTAL_DEFAULT,
        username: (c.username ?? prev.username).trim() || IPTV_USERNAME_DEFAULT,
        password: (c.password ?? prev.password).trim() || IPTV_PASSWORD_DEFAULT,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setHasCustomCode(!credentialsEqual(next, DEFAULT_CREDENTIALS));
      } catch {
        setHasCustomCode(!credentialsEqual(next, DEFAULT_CREDENTIALS));
      }
      return next;
    });
  }, []);

  const setSavedPlaylistUrl = useCallback((url: string | null) => {
    try {
      if (url?.trim()) {
        localStorage.setItem(PLAYLIST_URL_KEY, url.trim());
        setSavedPlaylistUrlState(url.trim());
      } else {
        localStorage.removeItem(PLAYLIST_URL_KEY);
        setSavedPlaylistUrlState(null);
      }
    } catch {
      setSavedPlaylistUrlState(url || null);
    }
  }, []);

  const setCodeOrLink = useCallback((value: string) => {
    const trimmed = value.trim();
    if (isPlaylistUrl(trimmed)) {
      setSavedPlaylistUrl(trimmed);
      return { isLink: true };
    }
    setCredentials({ password: trimmed || IPTV_PASSWORD_DEFAULT });
    return { isLink: false };
  }, [setCredentials, setSavedPlaylistUrl]);

  const clearCredentials = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_CODE_KEY);
      localStorage.removeItem(PLAYLIST_URL_KEY);
    } catch {
      // ignore
    }
    setCredentialsState(DEFAULT_CREDENTIALS);
    setHasCustomCode(false);
    setSavedPlaylistUrlState(null);
  }, []);

  return (
    <IptvCodeContext.Provider
      value={{
        credentials,
        hasCustomCode,
        savedPlaylistUrl,
        setCredentials,
        setCodeOrLink,
        setSavedPlaylistUrl,
        clearCredentials,
      }}
    >
      {children}
    </IptvCodeContext.Provider>
  );
}

export function useIptvCode(): IptvCodeState {
  const ctx = useContext(IptvCodeContext);
  if (!ctx) throw new Error("useIptvCode must be used within IptvCodeProvider");
  return ctx;
}
