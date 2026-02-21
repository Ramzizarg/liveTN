import { useState } from "react";
import { Tv, KeyRound, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useIptvCode, isPlaylistUrl } from "@/contexts/IptvCodeContext";
import { useChannels } from "@/contexts/ChannelsContext";
import {
  IPTV_PASSWORD_DEFAULT,
  IPTV_PORTAL_DEFAULT,
  IPTV_USERNAME_DEFAULT,
} from "@/data/channels";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Navbar() {
  const {
    credentials,
    hasCustomCode,
    savedPlaylistUrl,
    setCredentials,
    setCodeOrLink,
    clearCredentials,
  } = useIptvCode();
  const { loadFromM3uUrls, reloadChannelsFromSavedLink, loading: channelsLoading } = useChannels();
  const [codeOrLink, setCodeOrLinkInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [portal, setPortal] = useState(credentials.portal);
  const [username, setUsername] = useState(credentials.username);
  const [password, setPassword] = useState(credentials.password);
  const [open, setOpen] = useState(false);

  const handleSaveCodeOrLink = async () => {
    const value = codeOrLink.trim();
    if (!value) return;
    const { isLink } = setCodeOrLink(value);
    if (isLink) await loadFromM3uUrls([value]);
    setCodeOrLinkInput("");
    setOpen(false);
  };

  const handleReloadChannels = async () => {
    await reloadChannelsFromSavedLink();
  };

  const handleSaveAdvanced = () => {
    setCredentials({ portal, username, password });
    setOpen(false);
  };

  const handleClear = () => {
    clearCredentials();
    setCodeOrLinkInput("");
    setPortal(IPTV_PORTAL_DEFAULT);
    setUsername(IPTV_USERNAME_DEFAULT);
    setPassword(IPTV_PASSWORD_DEFAULT);
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setPortal(credentials.portal);
      setUsername(credentials.username);
      setPassword(credentials.password);
    }
  };

  const codeOrLinkPlaceholder = "e.g. 555788406 or http://...playlist.m3u";
  const isLink = isPlaylistUrl(codeOrLink);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background to-transparent">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
        {/* Logo - touch target on mobile */}
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-2.5 group min-h-[44px] items-center -my-1 touch-manipulation"
        >
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-live group-hover:bg-primary/90 transition-colors flex-shrink-0">
            <Tv className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg sm:text-xl tracking-tight">
            Live<span className="text-primary">TV</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Code or link (like IPTV Smarters / XCIPTV) */}
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px] touch-manipulation"
                aria-label="Enter code or playlist link (like XCIPTV)"
              >
                <KeyRound className={`h-5 w-5 ${hasCustomCode || savedPlaylistUrl ? "text-primary" : "text-muted-foreground"}`} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Code or playlist link</DialogTitle>
                <DialogDescription>
                  Enter the code or link from your provider (e.g. Loop Tunisien). Reload the app or use &quot;Reload channels&quot; to load channels from a link.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="code-or-link">Code or playlist link</Label>
                  <Input
                    id="code-or-link"
                    type="text"
                    placeholder={codeOrLinkPlaceholder}
                    value={codeOrLink}
                    onChange={(e) => setCodeOrLinkInput(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                {savedPlaylistUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleReloadChannels}
                    disabled={channelsLoading}
                    className="w-full"
                  >
                    <RotateCw className={`h-4 w-4 mr-2 ${channelsLoading ? "animate-spin" : ""}`} />
                    Reload channels
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setShowAdvanced((a) => !a)}
                  className="text-xs text-muted-foreground hover:text-foreground text-left"
                >
                  {showAdvanced ? "Hide" : "Show"} Xtream (Portal / Username / Password)
                </button>
                {showAdvanced && (
                  <div className="grid gap-2 border-t pt-4 space-y-2">
                    <Label>Portal URL</Label>
                    <Input
                      type="url"
                      placeholder="http://server:port"
                      value={portal}
                      onChange={(e) => setPortal(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Label>Username</Label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="font-mono"
                    />
                    <Label>Password</Label>
                    <Input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleClear}>
                  Clear (use default)
                </Button>
                {showAdvanced ? (
                  <Button onClick={handleSaveAdvanced}>Save Xtream</Button>
                ) : (
                  <Button onClick={handleSaveCodeOrLink} disabled={!codeOrLink.trim() || channelsLoading}>
                    {isLink ? "Save & load channels" : "Save"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Live indicator - shorter on mobile */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary animate-live-pulse inline-block shadow-live flex-shrink-0" />
            <span className="font-medium hidden sm:inline">Broadcasting Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}
