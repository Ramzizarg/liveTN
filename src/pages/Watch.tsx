import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Channel } from "@/data/channels";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LiveBadge } from "@/components/LiveBadge";
import { Navbar } from "@/components/Navbar";
import { useChannels } from "@/contexts/ChannelsContext";
import { useIptvCode } from "@/contexts/IptvCodeContext";
import { useEpg } from "@/hooks/useEpg";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Tv,
  LayoutGrid,
  Search,
} from "lucide-react";

export default function Watch() {
  const { channels } = useChannels();
  const { credentials } = useIptvCode();
  const { getProgrammeForChannel } = useEpg(credentials.portal, credentials.username, credentials.password);
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarImgErrors, setSidebarImgErrors] = useState<Record<string, boolean>>({});
  const [channelSearch, setChannelSearch] = useState("");

  const currentIndex = channels.findIndex((c) => c.id === channelId);
  const channel = channels[currentIndex] ?? null;
  const epgInfo = channel ? getProgrammeForChannel(channel.id) : null;

  /** Current (playing) channel first, then the rest — so "channel run now" is on top */
  const channelsWithCurrentFirst = channel
    ? [channel, ...channels.filter((c) => c.id !== channel.id)]
    : channels;

  /** Filter by search (name) */
  const filteredChannels = channelSearch.trim()
    ? channelsWithCurrentFirst.filter((ch) =>
        ch.name.toLowerCase().includes(channelSearch.toLowerCase())
      )
    : channelsWithCurrentFirst;

  const goToChannel = useCallback(
    (ch: Channel) => {
      navigate(`/watch/${ch.id}`);
    },
    [navigate]
  );

  const goNext = useCallback(() => {
    if (currentIndex < channels.length - 1) goToChannel(channels[currentIndex + 1]);
    else goToChannel(channels[0]);
  }, [currentIndex, goToChannel]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) goToChannel(channels[currentIndex - 1]);
    else goToChannel(channels[channels.length - 1]);
  }, [currentIndex, goToChannel]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "Escape") navigate("/");
      if (e.key === "s" || e.key === "S") setSidebarOpen((o) => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, navigate]);

  if (!channel) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Tv className="w-12 h-12 text-muted-foreground" />
        <h2 className="font-display font-bold text-2xl">Channel not found</h2>
        <Link
          to="/"
          className="text-accent hover:underline text-sm font-medium"
        >
          Back to all channels
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top bar - compact on mobile, touch-friendly */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background/95 to-transparent py-3 px-4 sm:py-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4 max-w-screen-2xl mx-auto">
          <Link
            to="/"
            className="flex items-center gap-2 min-h-[44px] min-w-[44px] sm:min-w-0 py-2 -my-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium group touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">All Channels</span>
          </Link>

          <div className="h-4 w-px bg-border flex-shrink-0" />

          {/* Channel info - truncate on mobile */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg sm:rounded bg-surface-2 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-foreground truncate">
                  {channel.name}
                </span>
                <LiveBadge size="sm" />
              </div>
              {epgInfo && (epgInfo.now || epgInfo.next) && (
                <div className="text-xs text-muted-foreground truncate mt-0.5 space-x-2">
                  {epgInfo.now && <span title={epgInfo.now.title}>Now: {epgInfo.now.title}</span>}
                  {epgInfo.next && <span title={epgInfo.next.title}>Next: {epgInfo.next.title}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Controls - 44px min touch on mobile */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={goPrev}
              title="Previous channel"
              className="min-h-[44px] min-w-[44px] sm:min-h-8 sm:min-w-8 rounded-xl sm:rounded-lg bg-surface-2 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-focus transition-all active:scale-95 touch-manipulation"
            >
              <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              title="Next channel"
              className="min-h-[44px] min-w-[44px] sm:min-h-8 sm:min-w-8 rounded-xl sm:rounded-lg bg-surface-2 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-focus transition-all active:scale-95 touch-manipulation"
            >
              <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              title="Toggle channel list"
              className={cn(
                "min-h-[44px] min-w-[44px] sm:min-h-8 sm:min-w-8 rounded-xl sm:rounded-lg border flex items-center justify-center transition-all touch-manipulation",
                sidebarOpen
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-surface-2 border-border text-muted-foreground hover:text-foreground hover:border-focus"
              )}
            >
              <LayoutGrid className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main layout - video first, then scrollable 2x2 channels on mobile */}
      <div className="flex flex-1 min-h-0 pt-14 sm:pt-16 overflow-hidden">
        {/* Video area - video at top (channel open), then scrollable channels on mobile */}
        <div className="flex-1 flex flex-col items-center p-3 sm:p-4 md:p-6 min-w-0 min-h-0 overflow-hidden">
          {/* Current channel video - always shown first */}
          <div className="w-full max-w-5xl mx-auto flex-shrink-0">
            <VideoPlayer
              key={channel.id}
              src={channel.stream_url}
              channelName={channel.name}
              className="w-full aspect-video min-h-[180px] sm:min-h-[200px] md:min-h-[380px] max-h-[70vh] sm:max-h-[75vh]"
            />
          </div>

          {/* More channels + search on same line (mobile) */}
          <div className="mt-3 sm:mt-4 md:hidden w-full flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-2 flex-shrink-0">
              <p className="text-xs text-muted-foreground font-medium">More channels</p>
              <div className="relative flex-shrink-0 w-32 sm:w-40">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-lg py-1.5 pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-focus min-h-[32px]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 overflow-y-auto overflow-x-hidden scrollbar-none pb-2 min-h-0">
              {filteredChannels.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => goToChannel(ch)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all touch-manipulation active:scale-[0.98]",
                    ch.id === channel.id
                      ? "border-focus bg-surface-3 shadow-focus"
                      : "border-border bg-surface-2 hover:border-focus/50 active:bg-surface-3"
                  )}
                >
                  <div className="w-12 h-12 rounded-lg bg-surface-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {!sidebarImgErrors[ch.id] ? (
                      <img
                        src={ch.logo}
                        alt={ch.name}
                        className="w-10 h-10 object-contain"
                        onError={() => setSidebarImgErrors((e) => ({ ...e, [ch.id]: true }))}
                      />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">{ch.name.slice(0, 2)}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-center leading-tight text-muted-foreground w-full truncate px-0.5">
                    {ch.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard hints */}
          <div className="hidden md:flex items-center gap-4 mt-3 text-xs text-muted-foreground/60">
            <span>← → Switch channel</span>
            <span>·</span>
            <span>S Toggle sidebar</span>
            <span>·</span>
            <span>Esc Back</span>
          </div>
        </div>

        {/* Sidebar - channel list (only this area scrolls) */}
        <div
          className={cn(
            "hidden md:flex flex-col min-h-0 bg-surface-2 border-l border-border transition-all duration-300 overflow-hidden",
            sidebarOpen ? "w-72" : "w-0 border-l-0"
          )}
        >
          <div className="p-4 border-b border-border flex-shrink-0 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display font-bold text-sm text-foreground">All Channels</h2>
              <div className="relative w-28 flex-shrink-0">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  className="w-full bg-background border border-border rounded-md py-1.5 pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-focus"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{filteredChannels.length} of {channels.length} channels</p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            {filteredChannels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => goToChannel(ch)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-border/50 hover:bg-surface-3 group",
                  ch.id === channel.id ? "bg-surface-3 border-l-2 border-l-primary" : ""
                )}
              >
                {/* Logo */}
                <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-surface-1 flex items-center justify-center overflow-hidden">
                  {!sidebarImgErrors[ch.id] ? (
                    <img
                      src={ch.logo}
                      alt={ch.name}
                      className="w-9 h-9 object-contain"
                      onError={() => setSidebarImgErrors((e) => ({ ...e, [ch.id]: true }))}
                    />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">{ch.name.slice(0, 2)}</span>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold truncate transition-colors",
                      ch.id === channel.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {ch.name}
                  </p>
                </div>
                {/* Live dot */}
                {ch.id === channel.id && (
                  <span className="w-2 h-2 rounded-full bg-primary shadow-live animate-live-pulse flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
