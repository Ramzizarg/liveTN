import { useState } from "react";
import { Tv, KeyRound, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useIptvCode } from "@/contexts/IptvCodeContext";
import { useChannels } from "@/contexts/ChannelsContext";
import {
  buildXtreamM3uUrl,
  IPTV_PASSWORD_DEFAULT,
  IPTV_PLAYLIST_NAME_DEFAULT,
  IPTV_PORTAL_DEFAULT,
  IPTV_USERNAME_DEFAULT,
} from "@/data/channels";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const {
    credentials,
    playlistName,
    hasCustomCode,
    setCredentials,
    setPlaylistName,
    setSavedPlaylistUrl,
    clearCredentials,
  } = useIptvCode();
  const { loadFromM3uUrls, loading: channelsLoading } = useChannels();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(playlistName);
  const [username, setUsername] = useState(credentials.username);
  const [password, setPassword] = useState(credentials.password);
  const [showPassword, setShowPassword] = useState(false);
  const [url, setUrl] = useState(credentials.portal);

  const handleSave = async () => {
    const portal = url.trim() || IPTV_PORTAL_DEFAULT;
    const user = username.trim() || IPTV_USERNAME_DEFAULT;
    const pass = password.trim() || IPTV_PASSWORD_DEFAULT;
    setCredentials({ portal, username: user, password: pass });
    setPlaylistName(name.trim() || IPTV_PLAYLIST_NAME_DEFAULT);
    const m3uUrl = buildXtreamM3uUrl(portal, user, pass);
    setSavedPlaylistUrl(m3uUrl);
    await loadFromM3uUrls([m3uUrl]);
    setOpen(false);
  };

  const handleClear = () => {
    clearCredentials();
    setName(IPTV_PLAYLIST_NAME_DEFAULT);
    setUsername(IPTV_USERNAME_DEFAULT);
    setPassword(IPTV_PASSWORD_DEFAULT);
    setUrl(IPTV_PORTAL_DEFAULT);
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setName(playlistName);
      setUsername(credentials.username);
      setPassword(credentials.password);
      setUrl(credentials.portal);
    }
  };

  const canSave = url.trim().length > 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background to-transparent">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
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
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px] touch-manipulation"
                aria-label="Enter playlist details"
              >
                <KeyRound className={`h-5 w-5 ${hasCustomCode ? "text-primary" : "text-muted-foreground"}`} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gradient-to-b from-[hsl(262,50%,12%)] to-[hsl(340,40%,18%)] border-[hsl(262,30%,22%)]">
              <DialogHeader className="text-center">
                <DialogTitle className="text-xl font-bold text-white">
                  Enter Your Playlist Details
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  type="text"
                  placeholder="Playlist Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground h-11"
                />
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-xl bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground h-11"
                />
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Input
                  type="url"
                  placeholder="http://url_here.com:port"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="rounded-xl bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground h-11 font-mono text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSave}
                  disabled={!canSave || channelsLoading}
                  className="w-full h-12 rounded-xl bg-white text-black font-bold hover:bg-white/90"
                >
                  {channelsLoading ? "Searching channels…" : "Save & search channels"}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">
                  Clear (use default)
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary animate-live-pulse inline-block shadow-live flex-shrink-0" />
            <span className="font-medium hidden sm:inline">Broadcasting Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}
