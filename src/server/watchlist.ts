"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { watchlistEntrySchema, updateWatchlistSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { ensureAnimeExists } from "@/server/anime-sync";

export async function getWatchlist(status?: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const where: Record<string, unknown> = { userId: session.user.id };
  if (status && status !== "ALL") {
    where.status = status;
  }

  const entries = await db.watchlistEntry.findMany({
    where,
    include: {
      anime: {
        select: {
          title: true,
          coverImage: true,
          episodes: true,
          format: true,
          anilistId: true,
          averageScore: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return entries.map((entry) => ({
    id: entry.id,
    animeId: entry.animeId,
    anilistId: entry.anime.anilistId,
    status: entry.status,
    score: entry.score,
    notes: entry.notes,
    anime: {
      title: entry.anime.title,
      coverImage: entry.anime.coverImage,
      episodes: entry.anime.episodes,
      format: entry.anime.format,
      averageScore: entry.anime.averageScore,
    },
    addedAt: entry.addedAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));
}

export async function addToWatchlist(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = watchlistEntrySchema.parse(input);
  const anime = await ensureAnimeExists(parsed.anilistId);

  await db.watchlistEntry.upsert({
    where: {
      userId_animeId: {
        userId: session.user.id,
        animeId: anime.id,
      },
    },
    create: {
      userId: session.user.id,
      animeId: anime.id,
      status: parsed.status,
      score: parsed.score ?? null,
      notes: parsed.notes ?? null,
    },
    update: {
      status: parsed.status,
      score: parsed.score ?? undefined,
      notes: parsed.notes ?? undefined,
    },
  });

  revalidatePath("/account");
  return { success: true };
}

export async function updateWatchlistEntry(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = updateWatchlistSchema.parse(input);
  const anime = await ensureAnimeExists(parsed.anilistId);

  await db.watchlistEntry.update({
    where: {
      userId_animeId: {
        userId: session.user.id,
        animeId: anime.id,
      },
    },
    data: {
      status: parsed.status,
      score: parsed.score,
      notes: parsed.notes,
    },
  });

  revalidatePath("/account");
  return { success: true };
}

export async function removeFromWatchlist(anilistId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const anime = await db.anime.findUnique({ where: { anilistId } });
  if (!anime) return { success: true };

  await db.watchlistEntry.deleteMany({
    where: { userId: session.user.id, animeId: anime.id },
  });

  revalidatePath("/account");
  return { success: true };
}

export async function getWatchlistStatus(anilistId: number) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const anime = await db.anime.findUnique({ where: { anilistId } });
  if (!anime) return null;

  const entry = await db.watchlistEntry.findUnique({
    where: {
      userId_animeId: {
        userId: session.user.id,
        animeId: anime.id,
      },
    },
  });

  return entry?.status ?? null;
}
