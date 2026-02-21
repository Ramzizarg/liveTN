import { useState, useEffect, useCallback, useRef } from "react";
import { Channel } from "@/data/channels";
import { ChannelCard } from "@/components/ChannelCard";
import { ChannelSkeleton } from "@/components/ChannelSkeleton";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Navbar } from "@/components/Navbar";
import { LiveBadge } from "@/components/LiveBadge";
import { useChannels } from "@/contexts/ChannelsContext";
import { ARA_M3U_URL } from "@/data/channels";
import { Search, X, ListPlus, RotateCcw, Loader2, Languages } from "lucide-react";

export default function Index() {
  const { channels, loading: channelsLoading, error: channelsError, loadWarning, loadFromM3uUrls, resetToDefault } = useChannels();
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [m3uUrls, setM3uUrls] = useState("");
  const [showM3uPanel, setShowM3uPanel] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const categories = ["All", ...Array.from(new Set(channels.map((c) => c.category).filter(Boolean)))].filter(
    (c, i, a) => a.indexOf(c) === i
  );

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const filtered: Channel[] = channels.filter((ch) => {
    const matchCat = activeCategory === "All" || ch.category === activeCategory;
    const matchSearch =
      !search ||
      ch.name.toLowerCase().includes(search.toLowerCase()) ||
      ch.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target === searchRef.current) return;

      const cols = window.innerWidth >= 1280 ? 6 : window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 4 : window.innerWidth >= 640 ? 3 : 2;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - 1, 0));
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + cols, filtered.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - cols, 0));
          break;
        case "/":
          e.preventDefault();
          searchRef.current?.focus();
          break;
      }
    },
    [filtered.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero section - compact on mobile */}
      <div className="pt-20 pb-6 px-4 sm:pt-24 sm:pb-8 sm:px-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <LiveBadge size="lg" />
            <span className="text-muted-foreground text-xs sm:text-sm font-medium">
              {channels.length} channels
            </span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-none">
            Watch Live TV
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
            Stream live channels — news, entertainment, sports, and more.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6 sm:mb-8">
          {/* Search bar - touch friendly */}
          <div className="relative flex-shrink-0 w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search channels..."
              value={search}
              maxLength={100}
              autoComplete="off"
              onChange={(e) => {
                const value = e.target.value.trimStart().slice(0, 100);
                setSearch(value);
                setFocusedIndex(0);
              }}
              className="w-full bg-surface-2 border border-border rounded-xl py-3 sm:py-2 pl-10 pr-11 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus transition-all min-h-[44px] sm:min-h-0"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 -m-2 text-muted-foreground hover:text-foreground touch-manipulation"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex-1 overflow-hidden">
            <CategoryFilter
              active={activeCategory}
              onChange={(cat) => { setActiveCategory(cat); setFocusedIndex(0); }}
              categories={categories.length > 1 ? categories : undefined}
            />
          </div>
        </div>

        {/* Load from M3U URLs - touch friendly */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowM3uPanel((v) => !v)}
            className="flex items-center gap-2 py-2.5 px-1 -mx-1 text-sm text-muted-foreground hover:text-foreground active:text-foreground touch-manipulation min-h-[44px]"
          >
            <ListPlus className="w-4 h-4 flex-shrink-0" />
            <span>{showM3uPanel ? "Hide" : "Load channels from M3U URL(s)"}</span>
          </button>
          {showM3uPanel && (
            <div className="mt-3 p-4 rounded-xl border border-border bg-surface-2 space-y-3">
              <p className="text-xs text-muted-foreground">
                Paste one or more M3U playlist URLs (one per line). Example: get.php?username=...&password=...&type=m3u_plus
              </p>
              <textarea
                value={m3uUrls}
                onChange={(e) => setM3uUrls(e.target.value)}
                placeholder="http://example.com/get.php?username=...&amp;password=...&type=m3u_plus"
                rows={4}
                className="w-full bg-background border border-border rounded-lg p-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-focus"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => loadFromM3uUrls([ARA_M3U_URL])}
                  disabled={channelsLoading}
                  className="flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-accent/90 text-accent-foreground text-sm font-medium hover:bg-accent disabled:opacity-50 active:scale-[0.98] touch-manipulation"
                >
                  {channelsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                  Load Arabic channels (ara.m3u)
                </button>
                <button
                  type="button"
                  onClick={() => loadFromM3uUrls(m3uUrls.split("\n"))}
                  disabled={channelsLoading || !m3uUrls.trim()}
                  className="flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98] touch-manipulation"
                >
                  {channelsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ListPlus className="w-4 h-4" />}
                  Load from URL(s) above
                </button>
                <button
                  type="button"
                  onClick={() => { setM3uUrls(""); resetToDefault(); setActiveCategory("All"); }}
                  className="flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-surface-3 border border-border text-sm font-medium hover:border-focus active:scale-[0.98] touch-manipulation"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to default
                </button>
              </div>
              {channelsError && (
                <p className="text-sm text-destructive">{channelsError}</p>
              )}
              {loadWarning && !channelsError && (
                <p className="text-sm text-muted-foreground">{loadWarning}</p>
              )}
            </div>
          )}
        </div>

        {/* Results count - hide keyboard hint on mobile */}
        {!loading && (
          <p className="text-muted-foreground text-xs mb-3 sm:mb-4">
            Showing <span className="text-foreground font-semibold">{filtered.length}</span> channel{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
            {search ? ` matching "${search}"` : ""}
            <span className="hidden sm:inline">
              {" · "}
              <span className="text-muted-foreground/60">Use arrow keys to navigate, Enter to watch</span>
            </span>
          </p>
        )}

        {/* Channel grid - 2 cols mobile, touch friendly gap */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
        >
          {loading || channelsLoading ? (
            <ChannelSkeleton count={12} />
          ) : filtered.length > 0 ? (
            filtered.map((channel, index) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                focused={focusedIndex === index}
                onFocus={() => setFocusedIndex(index)}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">No channels found</h3>
              <p className="text-muted-foreground text-sm">Try a different category or search term</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer - compact on mobile */}
      <footer className="border-t border-border mt-12 sm:mt-16 py-6 sm:py-8 px-4 text-center text-muted-foreground text-xs">
        <p>LiveTV · All streams are publicly available · No recording, no replay</p>
      </footer>
    </div>
  );
}
