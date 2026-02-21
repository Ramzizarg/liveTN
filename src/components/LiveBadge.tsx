import { cn } from "@/lib/utils";

interface LiveBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LiveBadge({ className, size = "md" }: LiveBadgeProps) {
  const sizes = {
    sm: "text-[9px] px-1.5 py-0.5 gap-1",
    md: "text-[10px] px-2 py-1 gap-1.5",
    lg: "text-xs px-3 py-1.5 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold uppercase tracking-widest rounded-sm",
        "bg-primary text-primary-foreground",
        "shadow-live",
        sizes[size],
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-live-pulse inline-block" />
      LIVE
    </span>
  );
}
