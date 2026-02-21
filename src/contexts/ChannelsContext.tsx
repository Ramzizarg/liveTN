import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  buildXtreamStreamUrl,
  channels as defaultChannels,
  fetchChannelsFromM3uUrls,
  TUNISIA_STREAM_IDS,
  type Channel,
} from "@/data/channels";
import { useIptvCode } from "@/contexts/IptvCodeContext";

type ChannelsState = {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  /** Set when some M3U URLs failed but we still loaded channels (e.g. "2 URLs failed (timeout)") */
  loadWarning: string | null;
  loadFromM3uUrls: (urls: string[]) => Promise<void>;
  /** Reload channels from the saved playlist link (if any). Like "Reload the app to load channels". */
  reloadChannelsFromSavedLink: () => Promise<void>;
  resetToDefault: () => void;
};

const ChannelsContext = createContext<ChannelsState | null>(null);

function applyIptvCredentialsToChannels(
  list: Channel[],
  portal: string,
  username: string,
  password: string
): Channel[] {
  return list.map((ch) => {
    const streamId = TUNISIA_STREAM_IDS[ch.id];
    if (!streamId) return ch;
    return {
      ...ch,
      stream_url: buildXtreamStreamUrl(portal, username, password, streamId),
    };
  });
}

export function ChannelsProvider({ children }: { children: ReactNode }) {
  const { credentials, savedPlaylistUrl } = useIptvCode();
  const [channels, setChannels] = useState<Channel[]>(() =>
    applyIptvCredentialsToChannels(
      defaultChannels,
      credentials.portal,
      credentials.username,
      credentials.password
    )
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadWarning, setLoadWarning] = useState<string | null>(null);

  const channelsWithCredentials = applyIptvCredentialsToChannels(
    channels,
    credentials.portal,
    credentials.username,
    credentials.password
  );

  const loadFromM3uUrls = useCallback(async (urls: string[]) => {
    const list = urls.map((u) => u.trim()).filter(Boolean);
    if (list.length === 0) return;
    setLoading(true);
    setError(null);
    setLoadWarning(null);
    try {
      const { channels: loaded, failedCount } = await fetchChannelsFromM3uUrls(list);
      if (loaded.length > 0) {
        setChannels(loaded);
        if (failedCount > 0) {
          setLoadWarning(
            `${failedCount} URL${failedCount === 1 ? "" : "s"} failed (timeout or server unreachable).`
          );
        }
      } else {
        setError(
          list.length === 1
            ? "No channels found or connection failed (timeout/CORS). Try another URL."
            : "No channels found from any URL. Servers may be down or blocking browser requests."
        );
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load playlist";
      setError(message + ". Some servers block browser requests (CORS) or may be unreachable.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reloadChannelsFromSavedLink = useCallback(async () => {
    if (savedPlaylistUrl?.trim()) await loadFromM3uUrls([savedPlaylistUrl.trim()]);
  }, [savedPlaylistUrl, loadFromM3uUrls]);

  const resetToDefault = useCallback(() => {
    setChannels(defaultChannels);
    setError(null);
    setLoadWarning(null);
  }, []);

  // On first load: if user has a saved playlist link, load channels – "Reload the app to load channels"
  const didAutoLoadFromLink = useRef(false);
  useEffect(() => {
    if (!savedPlaylistUrl?.trim() || didAutoLoadFromLink.current) return;
    didAutoLoadFromLink.current = true;
    loadFromM3uUrls([savedPlaylistUrl.trim()]);
  }, [savedPlaylistUrl, loadFromM3uUrls]);

  return (
    <ChannelsContext.Provider
      value={{
        channels: channelsWithCredentials,
        loading,
        error,
        loadWarning,
        loadFromM3uUrls,
        reloadChannelsFromSavedLink,
        resetToDefault,
      }}
    >
      {children}
    </ChannelsContext.Provider>
  );
}

export function useChannels(): ChannelsState {
  const ctx = useContext(ChannelsContext);
  if (!ctx) throw new Error("useChannels must be used within ChannelsProvider");
  return ctx;
}
