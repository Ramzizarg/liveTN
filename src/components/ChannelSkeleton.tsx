import { cn } from "@/lib/utils";

interface ChannelSkeletonProps {
  count?: number;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-surface-2 border border-border">
      {/* Logo area */}
      <div className="aspect-video skeleton" />
      {/* Info area */}
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function ChannelSkeleton({ count = 12 }: ChannelSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}

export function PlayerSkeleton() {
  return (
    <div className="w-full aspect-video skeleton rounded-xl" />
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton rounded", className)} />;
}
