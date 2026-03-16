"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HiAnimeResult {
  id: string;
  name: string;
  poster: string;
  episodes?: { sub: number; dub: number };
}

interface WatchButtonProps {
  animeTitle: string;
  anilistId: number;
}

export function WatchButton({ animeTitle }: WatchButtonProps) {
  const [hiAnimeId, setHiAnimeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<HiAnimeResult[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const searchTitle = animeTitle.replace(/[^\w\s]/g, "").trim();
    if (!searchTitle) {
      setLoading(false);
      return;
    }

    fetch(`/api/hianime/search?q=${encodeURIComponent(searchTitle)}`)
      .then((r) => r.json())
      .then((data) => {
        const animes: HiAnimeResult[] = data.animes ?? [];
        setSearchResults(animes);

        // Auto-match by title similarity
        const exactMatch = animes.find(
          (a: HiAnimeResult) =>
            a.name.toLowerCase() === animeTitle.toLowerCase()
        );
        if (exactMatch) {
          setHiAnimeId(exactMatch.id);
        } else if (animes.length === 1) {
          setHiAnimeId(animes[0].id);
        } else if (animes.length > 1) {
          // Try partial match
          const partial = animes.find((a: HiAnimeResult) =>
            a.name.toLowerCase().includes(animeTitle.toLowerCase()) ||
            animeTitle.toLowerCase().includes(a.name.toLowerCase())
          );
          if (partial) {
            setHiAnimeId(partial.id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [animeTitle]);

  if (loading) {
    return (
      <Button disabled className="gap-2 rounded-full px-6 py-3 text-base">
        <Loader2 className="h-5 w-5 animate-spin" />
        Finding streams...
      </Button>
    );
  }

  if (hiAnimeId) {
    return (
      <div className="relative flex gap-2">
        <Link href={`/watch/${hiAnimeId}`}>
          <Button size="lg" className="gap-2 rounded-full bg-primary px-8 py-3 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30">
            <Play className="h-5 w-5 fill-current" />
            Watch now
          </Button>
        </Link>
        {searchResults.length > 1 && (
          <Button
            variant="outline"
            size="lg"
            className="rounded-full"
            onClick={() => setShowPicker(!showPicker)}
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
        {showPicker && (
          <div className="absolute z-50 mt-12 w-72 rounded-lg border border-border bg-card p-2 shadow-xl">
            <p className="mb-2 text-xs text-muted-foreground">Choose version:</p>
            {searchResults.map((r) => (
              <Link
                key={r.id}
                href={`/watch/${r.id}`}
                className="block rounded-md px-3 py-2 text-sm hover:bg-secondary"
                onClick={() => setShowPicker(false)}
              >
                {r.name}
                {r.episodes && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Sub: {r.episodes.sub}, Dub: {r.episodes.dub})
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (searchResults.length > 0) {
    return (
      <div className="relative">
        <Button
          size="lg"
          className="gap-2 rounded-full bg-primary px-8 py-3 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
          onClick={() => setShowPicker(!showPicker)}
        >
          <Play className="h-5 w-5" />
          Watch now
        </Button>
        {showPicker && (
          <div className="absolute z-50 mt-2 w-72 rounded-lg border border-border bg-card p-2 shadow-xl">
            <p className="mb-2 text-xs text-muted-foreground">
              Select the correct version:
            </p>
            {searchResults.map((r) => (
              <Link
                key={r.id}
                href={`/watch/${r.id}`}
                className="block rounded-md px-3 py-2 text-sm hover:bg-secondary"
                onClick={() => setShowPicker(false)}
              >
                {r.name}
                {r.episodes && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Sub: {r.episodes.sub}, Dub: {r.episodes.dub})
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
