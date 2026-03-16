import { z } from "zod";

export const watchlistEntrySchema = z.object({
  anilistId: z.number().int().positive(),
  status: z.enum(["WATCHING", "COMPLETED", "PLANNING", "DROPPED", "ON_HOLD"]),
  score: z.number().int().min(0).max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateWatchlistSchema = watchlistEntrySchema.partial().extend({
  anilistId: z.number().int().positive(),
});

export const progressSchema = z.object({
  anilistId: z.number().int().positive(),
  currentEpisode: z.number().int().min(0).max(9999),
});

export const commentSchema = z.object({
  animeAnilistId: z.number().int().positive(),
  content: z.string().min(1).max(5000).trim(),
  episode: z.number().int().positive().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
});

export const commentReactionSchema = z.object({
  commentId: z.string().cuid(),
  emoji: z.string().min(1).max(8),
});

export const searchFiltersSchema = z.object({
  query: z.string().max(200).optional(),
  genres: z.array(z.string()).optional(),
  year: z.number().int().min(1940).max(2030).optional(),
  season: z.enum(["WINTER", "SPRING", "SUMMER", "FALL"]).optional(),
  format: z.enum(["TV", "TV_SHORT", "MOVIE", "SPECIAL", "OVA", "ONA", "MUSIC"]).optional(),
  status: z.enum(["RELEASING", "FINISHED", "NOT_YET_RELEASED", "CANCELLED", "HIATUS"]).optional(),
  sort: z.string().optional(),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(50).default(20),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(50).trim().optional(),
  bio: z.string().max(500).trim().optional().nullable(),
  image: z.string().url().optional().nullable(),
});

export type WatchlistEntryInput = z.infer<typeof watchlistEntrySchema>;
export type ProgressInput = z.infer<typeof progressSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
