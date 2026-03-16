import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { progressSchema } from "@/lib/validations";
import { ensureAnimeExists } from "@/server/anime-sync";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await db.progressEntry.findMany({
    where: { userId: session.user.id },
    include: {
      anime: {
        select: { anilistId: true, title: true, coverImage: true, episodes: true, format: true },
      },
    },
    orderBy: { lastWatchedAt: "desc" },
    take: 50,
  });

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const anime = await ensureAnimeExists(parsed.data.anilistId);

  const entry = await db.progressEntry.upsert({
    where: {
      userId_animeId: { userId: session.user.id, animeId: anime.id },
    },
    create: {
      userId: session.user.id,
      animeId: anime.id,
      currentEpisode: parsed.data.currentEpisode,
      lastWatchedAt: new Date(),
    },
    update: {
      currentEpisode: parsed.data.currentEpisode,
      lastWatchedAt: new Date(),
    },
  });

  return NextResponse.json(entry);
}
