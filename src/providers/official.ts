import type { ProviderResult, StreamingLink, EpisodeInfo } from "@/types";
import type { EpisodeProvider, StreamingProvider } from "@/providers/interfaces";

/**
 * Official streaming provider adapter.
 * Links users to legal streaming platforms based on AniList external links.
 * 
 * This does NOT scrape or proxy content — it provides direct links
 * to official platforms (Crunchyroll, Funimation, Netflix, etc.)
 */
export class OfficialStreamingProvider implements StreamingProvider {
  readonly name = "official";

  private readonly KNOWN_LEGAL_SITES = new Set([
    "Crunchyroll",
    "Funimation",
    "Netflix",
    "Amazon",
    "Hulu",
    "Disney Plus",
    "HBO Max",
    "Hidive",
    "VRV",
    "Bilibili",
    "YouTube",
    "Tubi",
    "Pluto TV",
    "ADN",
    "Wakanim",
    "AnimeLab",
  ]);

  async getStreamingLinks(animeId: number): Promise<ProviderResult<StreamingLink[]>> {
    // Fetch external links from AniList
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          externalLinks { url site icon color }
        }
      }
    `;

    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { id: animeId } }),
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        return { success: false, error: "Failed to fetch streaming links", provider: this.name };
      }

      const json = await response.json();
      const externalLinks = json.data?.Media?.externalLinks ?? [];

      const links: StreamingLink[] = externalLinks
        .filter((link: { site: string }) => this.KNOWN_LEGAL_SITES.has(link.site))
        .map((link: { site: string; url: string }) => ({
          provider: link.site,
          url: link.url,
          isLegal: true,
        }));

      return { success: true, data: links, provider: this.name };
    } catch {
      return { success: false, error: "Network error", provider: this.name };
    }
  }

  async isAvailable(animeId: number): Promise<boolean> {
    const result = await this.getStreamingLinks(animeId);
    return result.success && (result.data?.length ?? 0) > 0;
  }
}

/**
 * AniList-based episode info provider.
 * Provides episode count and airing information from AniList metadata.
 */
export class AniListEpisodeProvider implements EpisodeProvider {
  readonly name = "anilist-episodes";

  async getEpisodes(animeId: number): Promise<ProviderResult<EpisodeInfo[]>> {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          episodes
          nextAiringEpisode { episode airingAt }
          streamingEpisodes { title thumbnail url site }
        }
      }
    `;

    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { id: animeId } }),
        next: { revalidate: 1800 },
      });

      if (!response.ok) {
        return { success: false, error: "Failed to fetch episodes", provider: this.name };
      }

      const json = await response.json();
      const media = json.data?.Media;
      if (!media) {
        return { success: false, error: "Anime not found", provider: this.name };
      }

      const totalEpisodes = media.episodes ?? media.nextAiringEpisode?.episode ?? 0;
      const streamingEps: Array<{ title: string; thumbnail: string }> = media.streamingEpisodes ?? [];

      const episodes: EpisodeInfo[] = Array.from({ length: totalEpisodes }, (_, i) => {
        const epNum = i + 1;
        const streamingEp = streamingEps.find((ep) =>
          ep.title?.includes(`Episode ${epNum}`) || ep.title?.includes(`- ${epNum}`)
        );
        return {
          number: epNum,
          title: streamingEp?.title,
          thumbnail: streamingEp?.thumbnail,
        };
      });

      return { success: true, data: episodes, provider: this.name };
    } catch {
      return { success: false, error: "Network error", provider: this.name };
    }
  }
}
