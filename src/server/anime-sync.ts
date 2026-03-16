"use server";

import { db } from "@/lib/db";
import { providers } from "@/providers";
import type { MediaFormat, MediaStatus, Season } from "@prisma/client";

/**
 * Ensures an anime exists in our local database by AniList ID.
 * If not found, fetches from AniList and caches locally.
 */
export async function ensureAnimeExists(anilistId: number) {
  const existing = await db.anime.findUnique({ where: { anilistId } });

  // Return cached if fresh (less than 24 hours old)
  if (existing) {
    const age = Date.now() - existing.cachedAt.getTime();
    if (age < 24 * 60 * 60 * 1000) return existing;
  }

  // Fetch from provider
  const metadataProvider = providers.getMetadataProvider();
  const media = await metadataProvider.getById(anilistId);
  if (!media) {
    if (existing) return existing; // Use stale cache if refresh fails
    throw new Error(`Anime not found: ${anilistId}`);
  }

  const data = {
    anilistId: media.id,
    malId: media.idMal ?? null,
    title: media.title.romaji ?? media.title.english ?? "Unknown",
    titleEnglish: media.title.english ?? null,
    titleNative: media.title.native ?? null,
    description: media.description ?? null,
    coverImage: media.coverImage?.extraLarge ?? media.coverImage?.large ?? null,
    bannerImage: media.bannerImage ?? null,
    format: (media.format as MediaFormat) ?? null,
    status: (media.status as MediaStatus) ?? null,
    season: (media.season as Season) ?? null,
    seasonYear: media.seasonYear ?? null,
    episodes: media.episodes ?? null,
    duration: media.duration ?? null,
    averageScore: media.averageScore ?? null,
    popularity: media.popularity ?? null,
    genres: media.genres ?? [],
    studios: media.studios?.nodes?.map((s) => s.name) ?? [],
    source: media.source ?? null,
    trailer: media.trailer ? `https://www.youtube.com/watch?v=${media.trailer.id}` : null,
    isAdult: media.isAdult ?? false,
    cachedAt: new Date(),
  };

  return db.anime.upsert({
    where: { anilistId },
    create: data,
    update: data,
  });
}
