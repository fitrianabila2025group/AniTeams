import type { AnimeMetadataProvider, EpisodeProvider, StreamingProvider, ProviderRegistry } from "@/providers/interfaces";
import { AniListProvider } from "@/providers/anilist";
import { OfficialStreamingProvider, AniListEpisodeProvider } from "@/providers/official";
import { HiAnimeEpisodeProvider, HiAnimeStreamingProvider } from "@/providers/hianime";

class DefaultProviderRegistry implements ProviderRegistry {
  private metadataProvider: AnimeMetadataProvider;
  private episodeProviders: EpisodeProvider[];
  private streamingProviders: StreamingProvider[];

  constructor() {
    this.metadataProvider = new AniListProvider();
    this.episodeProviders = [new HiAnimeEpisodeProvider(), new AniListEpisodeProvider()];
    this.streamingProviders = [new HiAnimeStreamingProvider(), new OfficialStreamingProvider()];
  }

  getMetadataProvider(): AnimeMetadataProvider {
    return this.metadataProvider;
  }

  getEpisodeProviders(): EpisodeProvider[] {
    return this.episodeProviders;
  }

  getStreamingProviders(): StreamingProvider[] {
    return this.streamingProviders;
  }
}

// Singleton registry
const globalForProviders = globalThis as unknown as {
  providerRegistry: ProviderRegistry | undefined;
};

export const providers: ProviderRegistry =
  globalForProviders.providerRegistry ?? new DefaultProviderRegistry();

if (process.env.NODE_ENV !== "production") {
  globalForProviders.providerRegistry = providers;
}

export { AniListProvider } from "@/providers/anilist";
export { OfficialStreamingProvider, AniListEpisodeProvider } from "@/providers/official";
export { HiAnimeEpisodeProvider, HiAnimeStreamingProvider } from "@/providers/hianime";
