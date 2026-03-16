import type { AnimeMedia, AnimeSearchResult, AnimeSearchFilters } from "@/types";
import type { AnimeMetadataProvider } from "@/providers/interfaces";

const ANILIST_API = "https://graphql.anilist.co";

const MEDIA_FRAGMENT = `
  fragment MediaFields on Media {
    id
    idMal
    title { romaji english native }
    description(asHtml: false)
    coverImage { extraLarge large medium color }
    bannerImage
    format
    status
    season
    seasonYear
    episodes
    duration
    averageScore
    meanScore
    popularity
    genres
    source
    isAdult
    nextAiringEpisode { airingAt episode timeUntilAiring }
    studios(isMain: true) { nodes { name isAnimationStudio } }
    trailer { id site }
    startDate { year month day }
    endDate { year month day }
    externalLinks { url site icon color }
  }
`;

const DETAIL_FRAGMENT = `
  fragment DetailFields on Media {
    ...MediaFields
    recommendations(perPage: 8, sort: RATING_DESC) {
      nodes { mediaRecommendation { ...MediaFields } }
    }
    relations {
      edges {
        relationType
        node { ...MediaFields }
      }
    }
    characters(perPage: 12, sort: [ROLE, RELEVANCE]) {
      edges {
        role
        node { id name { full } image { medium } }
        voiceActors(language: JAPANESE) { id name { full } image { medium } language }
      }
    }
    staff(perPage: 8) {
      edges {
        role
        node { id name { full } image { medium } }
      }
    }
  }
  ${MEDIA_FRAGMENT}
`;

async function anilistQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(ANILIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`);
  }

  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(`AniList query error: ${json.errors[0].message}`);
  }

  return json.data;
}

export class AniListProvider implements AnimeMetadataProvider {
  readonly name = "anilist";

  async search(filters: AnimeSearchFilters): Promise<AnimeSearchResult> {
    const query = `
      query SearchAnime($page: Int, $perPage: Int, $search: String, $genres: [String], $seasonYear: Int, $season: MediaSeason, $format: MediaFormat, $status: MediaStatus, $sort: [MediaSort]) {
        Page(page: $page, perPage: $perPage) {
          pageInfo { total currentPage lastPage hasNextPage perPage }
          media(search: $search, genre_in: $genres, seasonYear: $seasonYear, season: $season, format: $format, status: $status, sort: $sort, type: ANIME, isAdult: false) {
            ...MediaFields
          }
        }
      }
      ${MEDIA_FRAGMENT}
    `;

    const variables: Record<string, unknown> = {
      page: filters.page ?? 1,
      perPage: filters.perPage ?? 20,
    };

    if (filters.query) variables.search = filters.query;
    if (filters.genres?.length) variables.genres = filters.genres;
    if (filters.year) variables.seasonYear = filters.year;
    if (filters.season) variables.season = filters.season;
    if (filters.format) variables.format = filters.format;
    if (filters.status) variables.status = filters.status;
    if (filters.sort) variables.sort = [filters.sort];

    const data = await anilistQuery<{ Page: { pageInfo: AnimeSearchResult["pageInfo"]; media: AnimeMedia[] } }>(query, variables);
    return { media: data.Page.media, pageInfo: data.Page.pageInfo };
  }

  async getById(id: number): Promise<AnimeMedia | null> {
    const query = `
      query GetAnime($id: Int) {
        Media(id: $id, type: ANIME) {
          ...DetailFields
        }
      }
      ${DETAIL_FRAGMENT}
    `;

    try {
      const data = await anilistQuery<{ Media: AnimeMedia }>(query, { id });
      return data.Media;
    } catch {
      return null;
    }
  }

  async getTrending(page = 1, perPage = 20): Promise<AnimeSearchResult> {
    return this.search({ sort: "TRENDING_DESC", page, perPage });
  }

  async getPopular(page = 1, perPage = 20): Promise<AnimeSearchResult> {
    return this.search({ sort: "POPULARITY_DESC", page, perPage });
  }

  async getSeasonal(year: number, season: string, page = 1, perPage = 20): Promise<AnimeSearchResult> {
    return this.search({ year, season, sort: "POPULARITY_DESC", page, perPage });
  }

  async getRecentlyUpdated(page = 1, perPage = 20): Promise<AnimeSearchResult> {
    return this.search({ status: "RELEASING", sort: "UPDATED_AT_DESC", page, perPage });
  }
}
