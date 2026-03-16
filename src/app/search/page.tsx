import type { Metadata } from "next";
import { providers } from "@/providers";
import { AnimeCard } from "@/components/anime-card";
import { SearchFilters } from "@/components/search-filters";
import { SearchPagination } from "@/components/search-pagination";

interface SearchPageProps {
  searchParams: Promise<{
    query?: string;
    genres?: string;
    year?: string;
    season?: string;
    format?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Browse Anime",
  description:
    "Search and discover thousands of anime series and movies. Filter by genre, year, season, format, and more on AniTeams.",
  alternates: {
    canonical: "/search",
  },
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const provider = providers.getMetadataProvider();

  const filters = {
    query: params.query,
    genres: params.genres?.split(",").filter(Boolean),
    year: params.year ? Number(params.year) : undefined,
    season: params.season,
    format: params.format,
    status: params.status,
    sort: params.sort ?? "TRENDING_DESC",
    page: params.page ? Number(params.page) : 1,
    perPage: 24,
  };

  const result = await provider.search(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Browse Anime</h1>

      <SearchFilters currentFilters={params} />

      {result.media.length > 0 ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {result.media.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
          <SearchPagination pageInfo={result.pageInfo} currentFilters={params} />
        </>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground">No anime found matching your filters.</p>
          <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
}
