"use client";

import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  hasSub: boolean;
  hasDub: boolean;
  hasRaw: boolean;
  activeCategory: "sub" | "dub" | "raw";
  onCategoryChange: (category: "sub" | "dub" | "raw") => void;
}

export function CategorySelector({
  hasSub,
  hasDub,
  hasRaw,
  activeCategory,
  onCategoryChange,
}: CategorySelectorProps) {
  const categories = [
    { key: "sub" as const, label: "SUB", available: hasSub },
    { key: "dub" as const, label: "DUB", available: hasDub },
    { key: "raw" as const, label: "RAW", available: hasRaw },
  ].filter((c) => c.available);

  if (categories.length <= 1) return null;

  return (
    <div className="flex gap-2">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onCategoryChange(cat.key)}
          className={cn(
            "rounded-md px-5 py-2 text-sm font-semibold transition-colors",
            activeCategory === cat.key
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
