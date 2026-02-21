import { Channel } from "@/data/channels";
import { LiveBadge } from "@/components/LiveBadge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";

interface ChannelCardProps {
  channel: Channel;
  focused?: boolean;
  onFocus?: () => void;
}

export function ChannelCard({ channel, focused, onFocus }: ChannelCardProps) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/watch/${channel.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Watch ${channel.name} - LIVE`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative rounded-xl overflow-hidden cursor-pointer touch-manipulation",
        "bg-surface-2 border transition-all duration-300 outline-none",
        "hover:scale-[1.03] hover:z-10 active:scale-[0.99]",
        "focus-visible:scale-[1.03] focus-visible:z-10",
        "min-h-[120px] sm:min-h-0",
        focused || hovered
          ? "border-focus shadow-focus"
          : "border-border shadow-card",
        "fade-in-up"
      )}
    >
      {/* Logo / Thumbnail Area */}
      <div className="relative bg-surface-1 aspect-video flex items-center justify-center overflow-hidden">
        {!imgError ? (
          <img
            src={channel.logo}
            alt={channel.name}
            onError={() => setImgError(true)}
            className={cn(
              "object-contain w-3/4 h-3/4 transition-transform duration-300",
              (focused || hovered) && "scale-110"
            )}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <span className="font-display font-bold text-2xl text-muted-foreground uppercase tracking-widest">
              {channel.name.slice(0, 2)}
            </span>
          </div>
        )}

        {/* Hover overlay with play button */}
        <div
          className={cn(
            "absolute inset-0 bg-background/60 flex items-center justify-center",
            "transition-opacity duration-200",
            (focused || hovered) ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-live scale-in">
            <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-1" />
          </div>
        </div>

        {/* LIVE Badge */}
        <div className="absolute top-2 left-2">
          <LiveBadge size="sm" />
        </div>

        {/* Country flag */}
        <div className="absolute top-2 right-2 text-sm opacity-70">
          {getFlagEmoji(channel.country)}
        </div>
      </div>

      {/* Info - touch-friendly padding on mobile */}
      <div className="p-3 sm:p-3">
        <h3 className="font-display font-semibold text-sm leading-tight text-foreground truncate group-hover:text-accent transition-colors duration-200">
          {channel.name}
        </h3>
      </div>

      {/* Bottom glow line on focus */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5 bg-focus transition-opacity duration-300",
          (focused || hovered) ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const flags: Record<string, string> = {
    QA: "🇶🇦", DE: "🇩🇪", US: "🇺🇸", FR: "🇫🇷", EU: "🇪🇺",
    GB: "🇬🇧", RU: "🇷🇺", TN: "🇹🇳", UN: "🌐",
  };
  return flags[countryCode] || "🌐";
}
