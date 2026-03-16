"use client";

import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

interface Episode {
  number: number;
  title?: string;
  episodeId?: string;
  isFiller?: boolean;
}

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisodeId?: string;
  onEpisodeSelect: (episode: Episode) => void;
  animeTitle?: string;
}

export function EpisodeList({
  episodes,
  currentEpisodeId,
  onEpisodeSelect,
  animeTitle,
}: EpisodeListProps) {
  return (
    <div className="flex flex-col">
      <h3 className="mb-3 text-lg font-semibold">
        Episodes {animeTitle && <span className="text-sm font-normal text-muted-foreground">— {animeTitle}</span>}
      </h3>
      <div className="max-h-[600px] space-y-1 overflow-y-auto pr-1">
        {episodes.map((ep) => {
          const isActive = currentEpisodeId === ep.episodeId;
          return (
            <button
              key={ep.episodeId ?? ep.number}
              onClick={() => onEpisodeSelect(ep)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary",
                ep.isFiller && "border-l-2 border-yellow-500"
              )}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-black/20">
                {isActive ? (
                  <Play className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <span className="text-xs font-medium">{ep.number}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {ep.title || `Episode ${ep.number}`}
                </p>
                {ep.isFiller && (
                  <span className="text-xs text-yellow-500">Filler</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
