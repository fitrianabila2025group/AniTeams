"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { progressSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { ensureAnimeExists } from "@/server/anime-sync";

export async function getProgress(anilistId: number) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const anime = await db.anime.findUnique({ where: { anilistId } });
  if (!anime) return null;

  const entry = await db.progressEntry.findUnique({
    where: {
      userId_animeId: {
        userId: session.user.id,
        animeId: anime.id,
      },
    },
  });

  return entry
    ? {
        currentEpisode: entry.currentEpisode,
        lastWatchedAt: entry.lastWatchedAt.toISOString(),
      }
    : null;
}

export async function updateProgress(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = progressSchema.parse(input);
  const anime = await ensureAnimeExists(parsed.anilistId);

  await db.progressEntry.upsert({
    where: {
      userId_animeId: {
        userId: session.user.id,
        animeId: anime.id,
      },
    },
    create: {
      userId: session.user.id,
      animeId: anime.id,
      currentEpisode: parsed.currentEpisode,
      lastWatchedAt: new Date(),
    },
    update: {
      currentEpisode: parsed.currentEpisode,
      lastWatchedAt: new Date(),
    },
  });

  // Auto-update watchlist to WATCHING if not already set
  const watchlistEntry = await db.watchlistEntry.findUnique({
    where: {
      userId_animeId: {
        userId: session.user.id,
        animeId: anime.id,
      },
    },
  });

  if (!watchlistEntry) {
    await db.watchlistEntry.create({
      data: {
        userId: session.user.id,
        animeId: anime.id,
        status: "WATCHING",
      },
    });
  }

  revalidatePath("/account");
  return { success: true };
}

export async function getContinueWatching() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const entries = await db.progressEntry.findMany({
    where: { userId: session.user.id },
    include: {
      anime: {
        select: {
          title: true,
          coverImage: true,
          episodes: true,
          format: true,
          anilistId: true,
        },
      },
    },
    orderBy: { lastWatchedAt: "desc" },
    take: 12,
  });

  return entries
    .filter((e) => !e.anime.episodes || e.currentEpisode < e.anime.episodes)
    .map((entry) => ({
      id: entry.id,
      animeId: entry.animeId,
      anilistId: entry.anime.anilistId,
      currentEpisode: entry.currentEpisode,
      lastWatchedAt: entry.lastWatchedAt.toISOString(),
      anime: {
        title: entry.anime.title,
        coverImage: entry.anime.coverImage,
        episodes: entry.anime.episodes,
        format: entry.anime.format,
      },
    }));
}
