"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookmarkPlus, Check, Loader2 } from "lucide-react";
import { addToWatchlist, getWatchlistStatus, removeFromWatchlist } from "@/server/watchlist";
import { useEffect } from "react";
import type { WatchStatus } from "@/types";

interface AnimeDetailActionsProps {
  anilistId: number;
}

const STATUS_OPTIONS: { value: WatchStatus; label: string }[] = [
  { value: "WATCHING", label: "Watching" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PLANNING", label: "Plan to Watch" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "DROPPED", label: "Dropped" },
];

export function AnimeDetailActions({ anilistId }: AnimeDetailActionsProps) {
  const [status, setStatus] = useState<WatchStatus | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const watchStatus = await getWatchlistStatus(anilistId);
        setStatus(watchStatus as WatchStatus | null);
      } catch {
        // Not logged in — fine
      }
      setLoaded(true);
    }
    load();
  }, [anilistId]);

  if (!loaded) return null;

  function handleAddToList(newStatus: string) {
    startTransition(async () => {
      await addToWatchlist({ anilistId, status: newStatus as WatchStatus });
      setStatus(newStatus as WatchStatus);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeFromWatchlist(anilistId);
      setStatus(null);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status ? (
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={handleAddToList} disabled={isPending}>
            <SelectTrigger className="w-auto gap-2 rounded-full">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={handleRemove} disabled={isPending} className="text-xs text-destructive">
            Remove
          </Button>
        </div>
      ) : (
        <Button onClick={() => handleAddToList("PLANNING")} disabled={isPending} variant="outline" className="gap-2 rounded-full">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />}
          Add to List
        </Button>
      )}
    </div>
  );
}
