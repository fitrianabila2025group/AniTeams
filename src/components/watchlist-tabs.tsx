"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimeCard } from "@/components/anime-card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import type { WatchStatus } from "@/types";

interface WatchlistEntry {
  id: string;
  animeId: string;
  anilistId: number;
  status: string;
  score: number | null;
  notes: string | null;
  anime: {
    title: string;
    coverImage: string | null;
    episodes: number | null;
    format: string | null;
    averageScore?: number | null;
  };
  addedAt: string;
  updatedAt: string;
}

interface WatchlistTabsProps {
  entries: WatchlistEntry[];
  userId: string;
}

const TABS: { value: string; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "WATCHING", label: "Watching" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PLANNING", label: "Planning" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "DROPPED", label: "Dropped" },
];

export function WatchlistTabs({ entries }: WatchlistTabsProps) {
  return (
    <Tabs defaultValue="ALL">
      <TabsList className="mb-6 flex-wrap">
        {TABS.map((tab) => {
          const count = tab.value === "ALL"
            ? entries.length
            : entries.filter((e) => e.status === tab.value).length;
          return (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
              {tab.label}
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1 text-xs">
                {count}
              </Badge>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {TABS.map((tab) => {
        const filtered = tab.value === "ALL"
          ? entries
          : entries.filter((e) => e.status === tab.value);

        return (
          <TabsContent key={tab.value} value={tab.value}>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filtered.map((entry) => (
                  <WatchlistCard key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-lg text-muted-foreground">No anime in this list yet.</p>
                <Link href="/search" className="mt-2 text-sm text-primary hover:underline">
                  Browse anime to add some
                </Link>
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function WatchlistCard({ entry }: { entry: WatchlistEntry }) {
  return (
    <Link href={`/anime/${entry.anilistId}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        {entry.anime.coverImage ? (
          <Image
            src={entry.anime.coverImage}
            alt={entry.anime.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
        )}
        <div className="absolute right-2 top-2">
          <Badge variant="secondary" className="text-xs">
            {entry.status.replace("_", " ")}
          </Badge>
        </div>
        {entry.score && (
          <div className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs text-white">
            ★ {(entry.score / 10).toFixed(1)}
          </div>
        )}
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-tight group-hover:text-primary">
        {entry.anime.title}
      </h3>
    </Link>
  );
}
