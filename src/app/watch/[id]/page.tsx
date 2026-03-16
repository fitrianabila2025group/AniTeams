import type { Metadata } from "next";
import { Suspense } from "react";
import { WatchPageClient } from "@/components/watch/watch-page-client";
import { hiAnimeGetInfo } from "@/providers/hianime";
import { auth } from "@/lib/auth";

interface WatchPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}

export async function generateMetadata({
  params,
}: WatchPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const info = await hiAnimeGetInfo(id);
    const name =
      (info as { anime?: { info?: { name?: string } } })?.anime?.info?.name ?? id;
    return { title: `Watch ${name}` };
  } catch {
    return { title: `Watch — ${id}` };
  }
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { id } = await params;
  const { ep } = await searchParams;

  let animeTitle = id;
  let poster: string | undefined;
  let anilistId: number | null = null;

  try {
    const info = await hiAnimeGetInfo(id);
    const animeData = info as { anime?: { info?: { name?: string; poster?: string; anilistId?: number | null } } };
    const animeInfo = animeData?.anime?.info;
    if (animeInfo?.name) animeTitle = animeInfo.name;
    if (animeInfo?.poster) poster = animeInfo.poster;
    if (animeInfo?.anilistId) anilistId = animeInfo.anilistId;
  } catch {
    // Fall back to id as title
  }

  const session = await auth();

  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense
        fallback={
          <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }
      >
        <WatchPageClient
          animeId={id}
          animeTitle={animeTitle}
          initialEpisodeId={ep}
          poster={poster}
          anilistId={anilistId}
          isLoggedIn={!!session?.user}
        />
      </Suspense>
    </div>
  );
}
