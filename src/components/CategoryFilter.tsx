import { CATEGORIES } from "@/data/channels";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  active: string;
  onChange: (category: string) => void;
  /** If provided, use these instead of default CATEGORIES (e.g. when loaded from M3U) */
  categories?: string[];
}

export function CategoryFilter({ active, onChange, categories }: CategoryFilterProps) {
  const list = categories ?? CATEGORIES;
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {list.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={cn(
            "flex-shrink-0 px-4 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-full text-sm font-semibold transition-all duration-200 outline-none touch-manipulation",
            "border focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.98]",
            active === cat
              ? "bg-primary text-primary-foreground border-primary shadow-live"
              : "bg-surface-2 text-muted-foreground border-border hover:border-focus hover:text-foreground"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
