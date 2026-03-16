"use client";

import { useState } from "react";
import { WatchPlayer } from "@/components/watch/watch-player";
import { CommentSection } from "@/components/comment-section";

interface WatchPageClientProps {
  animeId: string;
  animeTitle: string;
  initialEpisodeId?: string;
  poster?: string;
  anilistId: number | null;
  isLoggedIn: boolean;
}

export function WatchPageClient({
  animeId,
  animeTitle,
  initialEpisodeId,
  poster,
  anilistId,
  isLoggedIn,
}: WatchPageClientProps) {
  const [currentEpisode, setCurrentEpisode] = useState<number | null>(null);

  return (
    <>
      <WatchPlayer
        animeId={animeId}
        animeTitle={animeTitle}
        initialEpisodeId={initialEpisodeId}
        poster={poster}
        onEpisodeChange={setCurrentEpisode}
      />

      {anilistId && currentEpisode != null && (
        <div className="mt-8">
          <CommentSection
            anilistId={anilistId}
            episode={currentEpisode}
            isLoggedIn={isLoggedIn}
          />
        </div>
      )}
    </>
  );
}
