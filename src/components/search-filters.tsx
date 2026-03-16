"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mecha", "Music", "Mystery", "Psychological", "Romance", "Sci-Fi",
  "Slice of Life", "Sports", "Supernatural", "Thriller",
];

const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"];
const FORMATS = ["TV", "TV_SHORT", "MOVIE", "SPECIAL", "OVA", "ONA", "MUSIC"];
const STATUSES = ["RELEASING", "FINISHED", "NOT_YET_RELEASED", "CANCELLED"];
const SORT_OPTIONS = [
  { value: "TRENDING_DESC", label: "Trending" },
  { value: "POPULARITY_DESC", label: "Popularity" },
  { value: "SCORE_DESC", label: "Score" },
  { value: "START_DATE_DESC", label: "Newest" },
  { value: "TITLE_ROMAJI", label: "Title A-Z" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1940 + 2 }, (_, i) => currentYear + 1 - i);

interface SearchFiltersProps {
  currentFilters: Record<string, string | undefined>;
}

export function SearchFilters({ currentFilters }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // Reset page on filter change
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.push("/search");
  }, [router]);

  const hasFilters = Object.values(currentFilters).some((v) => v);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="Search anime..."
          defaultValue={currentFilters.query ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateFilter("query", (e.target as HTMLInputElement).value || undefined);
            }
          }}
          className="max-w-md"
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={currentFilters.sort ?? "TRENDING_DESC"} onValueChange={(v) => updateFilter("sort", v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentFilters.genres ?? ""} onValueChange={(v) => updateFilter("genres", v || undefined)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            {GENRES.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentFilters.year ?? ""} onValueChange={(v) => updateFilter("year", v || undefined)}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentFilters.season ?? ""} onValueChange={(v) => updateFilter("season", v || undefined)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent>
            {SEASONS.map((s) => (
              <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentFilters.format ?? ""} onValueChange={(v) => updateFilter("format", v || undefined)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            {FORMATS.map((f) => (
              <SelectItem key={f} value={f}>{f.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentFilters.status ?? ""} onValueChange={(v) => updateFilter("status", v || undefined)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
