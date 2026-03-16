import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { commentSchema } from "@/lib/validations";
import { ensureAnimeExists } from "@/server/anime-sync";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const anilistId = Number(searchParams.get("anilistId"));
  const episode = searchParams.get("episode") ? Number(searchParams.get("episode")) : null;
  const page = Number(searchParams.get("page") ?? "1");
  const perPage = Math.min(Number(searchParams.get("perPage") ?? "20"), 50);

  if (!anilistId || Number.isNaN(anilistId)) {
    return NextResponse.json({ error: "Invalid anilistId" }, { status: 400 });
  }

  const anime = await db.anime.findUnique({ where: { anilistId } });
  if (!anime) {
    return NextResponse.json({ comments: [], total: 0 });
  }

  const session = await auth();
  const userId = session?.user?.id;

  const where: Record<string, unknown> = {
    animeId: anime.id,
    parentId: null,
    isDeleted: false,
  };
  if (episode != null) where.episode = episode;

  const [comments, total] = await Promise.all([
    db.comment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, image: true } },
        reactions: true,
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.comment.count({ where }),
  ]);

  const formatted = comments.map((c) => ({
    id: c.id,
    content: c.content,
    episode: c.episode,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    isDeleted: c.isDeleted,
    user: c.user,
    reactions: aggregateReactions(c.reactions, userId),
    replyCount: c._count.replies,
  }));

  return NextResponse.json({ comments: formatted, total });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const anime = await ensureAnimeExists(parsed.data.animeAnilistId);

  const comment = await db.comment.create({
    data: {
      userId: session.user.id,
      animeId: anime.id,
      content: parsed.data.content,
      episode: parsed.data.episode ?? null,
      parentId: parsed.data.parentId ?? null,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json({
    id: comment.id,
    content: comment.content,
    episode: comment.episode,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    isDeleted: false,
    user: comment.user,
    reactions: [],
    replyCount: 0,
  }, { status: 201 });
}

function aggregateReactions(
  reactions: Array<{ userId: string; emoji: string }>,
  currentUserId?: string,
) {
  const map = new Map<string, { count: number; userReacted: boolean }>();
  for (const r of reactions) {
    const existing = map.get(r.emoji) ?? { count: 0, userReacted: false };
    existing.count++;
    if (r.userId === currentUserId) existing.userReacted = true;
    map.set(r.emoji, existing);
  }
  return Array.from(map.entries()).map(([emoji, data]) => ({ emoji, ...data }));
}
