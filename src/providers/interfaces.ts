import type { AnimeMedia, AnimeSearchResult, AnimeSearchFilters, EpisodeInfo, StreamingLink, ProviderResult } from "@/types";

/**
 * Provides anime metadata (title, description, cover, genres, etc.)
 * Primary implementation: AniList GraphQL API
 */
export interface AnimeMetadataProvider {
  readonly name: string;

  search(filters: AnimeSearchFilters): Promise<AnimeSearchResult>;
  getById(id: number): Promise<AnimeMedia | null>;
  getTrending(page?: number, perPage?: number): Promise<AnimeSearchResult>;
  getPopular(page?: number, perPage?: number): Promise<AnimeSearchResult>;
  getSeasonal(year: number, season: string, page?: number, perPage?: number): Promise<AnimeSearchResult>;
  getRecentlyUpdated(page?: number, perPage?: number): Promise<AnimeSearchResult>;
}

/**
 * Provides episode information for an anime
 */
export interface EpisodeProvider {
  readonly name: string;

  getEpisodes(animeId: number): Promise<ProviderResult<EpisodeInfo[]>>;
}

/**
 * Provides legal streaming links for an anime
 */
export interface StreamingProvider {
  readonly name: string;

  getStreamingLinks(animeId: number): Promise<ProviderResult<StreamingLink[]>>;
  isAvailable(animeId: number, region?: string): Promise<boolean>;
}

/**
 * Manages multiple providers and handles fallbacks
 */
export interface ProviderRegistry {
  getMetadataProvider(): AnimeMetadataProvider;
  getEpisodeProviders(): EpisodeProvider[];
  getStreamingProviders(): StreamingProvider[];
}
