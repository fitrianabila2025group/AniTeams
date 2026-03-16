import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { watchlistEntrySchema } from "@/lib/validations";
import { ensureAnimeExists } from "@/server/anime-sync";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await db.watchlistEntry.findMany({
    where: { userId: session.user.id },
    include: {
      anime: {
        select: { anilistId: true, title: true, coverImage: true, episodes: true, format: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = watchlistEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const anime = await ensureAnimeExists(parsed.data.anilistId);

  const entry = await db.watchlistEntry.upsert({
    where: {
      userId_animeId: { userId: session.user.id, animeId: anime.id },
    },
    create: {
      userId: session.user.id,
      animeId: anime.id,
      status: parsed.data.status,
      score: parsed.data.score ?? null,
      notes: parsed.data.notes ?? null,
    },
    update: {
      status: parsed.data.status,
      score: parsed.data.score ?? undefined,
      notes: parsed.data.notes ?? undefined,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const anilistId = Number(searchParams.get("anilistId"));
  if (!anilistId || Number.isNaN(anilistId)) {
    return NextResponse.json({ error: "Invalid anilistId" }, { status: 400 });
  }

  const anime = await db.anime.findUnique({ where: { anilistId } });
  if (!anime) {
    return NextResponse.json({ success: true });
  }

  await db.watchlistEntry.deleteMany({
    where: { userId: session.user.id, animeId: anime.id },
  });

  return NextResponse.json({ success: true });
}
