import type { Metadata } from "next";
import { Suspense } from "react";
import { providers } from "@/providers";
import { HeroBanner } from "@/components/hero-banner";
import { AnimeGrid } from "@/components/anime-grid";
import { AnimeGridSkeleton } from "@/components/anime-card-skeleton";
import { ContinueWatchingSection } from "@/components/continue-watching";

export const metadata: Metadata = {
  title: "AniTeams — Watch Anime Online for Free",
  description:
    "Watch anime online for free in HD quality. Stream the latest trending and most popular anime series and movies with subtitles on AniTeams.",
  alternates: {
    canonical: "/",
  },
};

function getCurrentSeason(): { season: string; year: number } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  if (month <= 3) return { season: "WINTER", year };
  if (month <= 6) return { season: "SPRING", year };
  if (month <= 9) return { season: "SUMMER", year };
  return { season: "FALL", year };
}

async function TrendingSection() {
  const provider = providers.getMetadataProvider();
  const result = await provider.getTrending(1, 12);
  return <AnimeGrid anime={result.media} title="Trending Now" viewAllHref="/search?sort=TRENDING_DESC" />;
}

async function SeasonalSection() {
  const { season, year } = getCurrentSeason();
  const provider = providers.getMetadataProvider();
  const result = await provider.getSeasonal(year, season, 1, 12);
  return (
    <AnimeGrid
      anime={result.media}
      title={`${season.charAt(0)}${season.slice(1).toLowerCase()} ${year}`}
      viewAllHref={`/search?season=${season}&year=${year}`}
    />
  );
}

async function PopularSection() {
  const provider = providers.getMetadataProvider();
  const result = await provider.getPopular(1, 12);
  return <AnimeGrid anime={result.media} title="Most Popular" viewAllHref="/search?sort=POPULARITY_DESC" />;
}

async function RecentlyUpdatedSection() {
  const provider = providers.getMetadataProvider();
  const result = await provider.getRecentlyUpdated(1, 12);
  return <AnimeGrid anime={result.media} title="Recently Updated" viewAllHref="/search?status=RELEASING" />;
}

async function HeroSection() {
  const provider = providers.getMetadataProvider();
  const result = await provider.getTrending(1, 1);
  const featured = result.media[0];
  if (!featured) return null;
  return <HeroBanner anime={featured} />;
}

export default function HomePage() {
  return (
    <div>
      <Suspense fallback={<div className="h-[70vh] animate-pulse bg-muted" />}>
        <HeroSection />
      </Suspense>

      <div className="container mx-auto space-y-12 px-4 py-12">
        <Suspense fallback={null}>
          <ContinueWatchingSection />
        </Suspense>

        <Suspense fallback={<AnimeGridSkeleton />}>
          <TrendingSection />
        </Suspense>

        <Suspense fallback={<AnimeGridSkeleton />}>
          <SeasonalSection />
        </Suspense>

        <Suspense fallback={<AnimeGridSkeleton />}>
          <PopularSection />
        </Suspense>

        <Suspense fallback={<AnimeGridSkeleton />}>
          <RecentlyUpdatedSection />
        </Suspense>
      </div>
    </div>
  );
}
