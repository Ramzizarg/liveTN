import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  channelName: string;
  className?: string;
  onError?: () => void;
}

const LOADING_TIMEOUT_MS = 12_000;

type PlayerState = "loading" | "playing" | "error";

/** Xtream .ts URLs often have an HLS version at .m3u8 – use that for HLS.js */
function toHlsUrlIfNeeded(url: string): string {
  if (/\.ts$/i.test(url.trim())) return url.trim().replace(/\.ts$/i, ".m3u8");
  return url;
}

export function VideoPlayer({ src, channelName, className, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PlayerState>("loading");
  const [retryCount, setRetryCount] = useState(0);

  const initPlayer = () => {
    const video = videoRef.current;
    if (!video) return;

    setState("loading");
    const hlsSrc = toHlsUrlIfNeeded(src);

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });

      hls.loadSource(hlsSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setState("error"));
        setState("playing");
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setState("error");
          onError?.();
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari)
      video.src = hlsSrc;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => setState("error"));
        setState("playing");
      });
      video.addEventListener("error", () => {
        setState("error");
        onError?.();
      });
    } else {
      setState("error");
    }
  };

  // Loading timeout: if stream never starts, show error so user isn't stuck
  useEffect(() => {
    if (state !== "loading") return;
    const t = setTimeout(() => setState("error"), LOADING_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [state, src]);

  useEffect(() => {
    initPlayer();
    return () => {
      hlsRef.current?.destroy();
    };
  }, [src]);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    initPlayer();
  };

  return (
    <div className={cn("relative bg-black rounded-xl overflow-hidden", className)}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted={false}
        autoPlay
        controls={state === "playing"}
        style={{ display: state === "error" ? "none" : "block" }}
      />

      {/* Loading overlay */}
      {state === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-1">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-surface-4 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            Connecting to <span className="text-foreground">{channelName}</span>...
          </p>
          <p className="text-muted-foreground text-xs mt-1 opacity-60">Loading live stream</p>
        </div>
      )}

      {/* Error overlay */}
      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-1 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-surface-3 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display font-bold text-lg text-foreground mb-1">
            Stream Unavailable
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            The live stream for <span className="text-foreground font-medium">{channelName}</span> is
            currently unavailable or blocked.
          </p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-live"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
          {retryCount > 0 && (
            <p className="text-muted-foreground text-xs mt-3">
              Tried {retryCount} time{retryCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
