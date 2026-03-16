// ─── Anime Metadata Types ───────────────────────────────

export interface AnimeMedia {
  id: number;
  idMal?: number | null;
  title: {
    romaji: string;
    english?: string | null;
    native?: string | null;
  };
  description?: string | null;
  coverImage?: {
    extraLarge?: string | null;
    large?: string | null;
    medium?: string | null;
    color?: string | null;
  } | null;
  bannerImage?: string | null;
  format?: string | null;
  status?: string | null;
  season?: string | null;
  seasonYear?: number | null;
  episodes?: number | null;
  duration?: number | null;
  averageScore?: number | null;
  meanScore?: number | null;
  popularity?: number | null;
  genres?: string[];
  studios?: { nodes: Array<{ name: string; isAnimationStudio: boolean }> } | null;
  source?: string | null;
  trailer?: { id: string; site: string } | null;
  startDate?: { year?: number; month?: number; day?: number } | null;
  endDate?: { year?: number; month?: number; day?: number } | null;
  isAdult?: boolean;
  nextAiringEpisode?: {
    airingAt: number;
    episode: number;
    timeUntilAiring: number;
  } | null;
  recommendations?: {
    nodes: Array<{
      mediaRecommendation: AnimeMedia;
    }>;
  } | null;
  relations?: {
    edges: Array<{
      relationType: string;
      node: AnimeMedia;
    }>;
  } | null;
  characters?: {
    edges: Array<{
      role: string;
      node: {
        id: number;
        name: { full: string };
        image: { medium: string };
      };
      voiceActors: Array<{
        id: number;
        name: { full: string };
        image: { medium: string };
        language: string;
      }>;
    }>;
  } | null;
  staff?: {
    edges: Array<{
      role: string;
      node: {
        id: number;
        name: { full: string };
        image: { medium: string };
      };
    }>;
  } | null;
  externalLinks?: Array<{
    url: string;
    site: string;
    icon?: string;
    color?: string;
  }>;
}

export interface AnimeSearchFilters {
  query?: string;
  genres?: string[];
  year?: number;
  season?: string;
  format?: string;
  status?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}

export interface AnimeSearchResult {
  media: AnimeMedia[];
  pageInfo: {
    total: number;
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
    perPage: number;
  };
}

// ─── Watchlist Types ────────────────────────────────────

export type WatchStatus = "WATCHING" | "COMPLETED" | "PLANNING" | "DROPPED" | "ON_HOLD";

export interface WatchlistItem {
  id: string;
  animeId: string;
  anilistId: number;
  status: WatchStatus;
  score?: number | null;
  notes?: string | null;
  anime: {
    title: string;
    coverImage: string | null;
    episodes: number | null;
    format: string | null;
  };
  addedAt: string;
  updatedAt: string;
}

// ─── Progress Types ─────────────────────────────────────

export interface ProgressItem {
  id: string;
  animeId: string;
  anilistId: number;
  currentEpisode: number;
  lastWatchedAt: string;
  anime: {
    title: string;
    coverImage: string | null;
    episodes: number | null;
    format: string | null;
  };
}

// ─── Comment Types ──────────────────────────────────────

export interface CommentData {
  id: string;
  content: string;
  episode?: number | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  reactions: Array<{
    emoji: string;
    count: number;
    userReacted: boolean;
  }>;
  replies?: CommentData[];
  replyCount?: number;
}

// ─── Provider Types ─────────────────────────────────────

export interface StreamingLink {
  provider: string;
  url: string;
  quality?: string;
  isLegal: boolean;
}

export interface EpisodeInfo {
  number: number;
  title?: string;
  aired?: string;
  thumbnail?: string;
  episodeId?: string;
  isFiller?: boolean;
}

export interface ProviderResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  provider: string;
}
