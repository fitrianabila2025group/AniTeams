"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { commentSchema, commentReactionSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { ensureAnimeExists } from "@/server/anime-sync";
import type { CommentData } from "@/types";

export async function getComments(
  anilistId: number,
  episode?: number | null,
  page = 1,
  perPage = 20,
): Promise<{ comments: CommentData[]; total: number }> {
  const session = await auth();
  const userId = session?.user?.id;

  const anime = await db.anime.findUnique({ where: { anilistId } });
  if (!anime) return { comments: [], total: 0 };

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

  return {
    comments: comments.map((c) => formatComment(c, userId)),
    total,
  };
}

export async function getReplies(commentId: string): Promise<CommentData[]> {
  const session = await auth();
  const userId = session?.user?.id;

  const replies = await db.comment.findMany({
    where: { parentId: commentId, isDeleted: false },
    include: {
      user: { select: { id: true, name: true, image: true } },
      reactions: true,
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return replies.map((r) => formatComment(r, userId));
}

export async function createComment(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = commentSchema.parse(input);
  const anime = await ensureAnimeExists(parsed.animeAnilistId);

  const comment = await db.comment.create({
    data: {
      userId: session.user.id,
      animeId: anime.id,
      content: parsed.content,
      episode: parsed.episode ?? null,
      parentId: parsed.parentId ?? null,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  revalidatePath(`/anime/${parsed.animeAnilistId}`);

  return {
    id: comment.id,
    content: comment.content,
    episode: comment.episode,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    isDeleted: false,
    user: comment.user,
    reactions: [],
    replyCount: 0,
  };
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const comment = await db.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error("Comment not found");

  // Only author or admin can delete
  if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  await db.comment.update({
    where: { id: commentId },
    data: { isDeleted: true },
  });

  return { success: true };
}

export async function toggleReaction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = commentReactionSchema.parse(input);

  const existing = await db.commentReaction.findUnique({
    where: {
      userId_commentId_emoji: {
        userId: session.user.id,
        commentId: parsed.commentId,
        emoji: parsed.emoji,
      },
    },
  });

  if (existing) {
    await db.commentReaction.delete({ where: { id: existing.id } });
  } else {
    await db.commentReaction.create({
      data: {
        userId: session.user.id,
        commentId: parsed.commentId,
        emoji: parsed.emoji,
      },
    });
  }

  return { success: true };
}

// ─── Helpers ────────────────────────────────────────────

type CommentWithRelations = {
  id: string;
  content: string;
  episode: number | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  user: { id: string; name: string | null; image: string | null };
  reactions: Array<{ userId: string; emoji: string }>;
  _count: { replies: number };
};

function formatComment(c: CommentWithRelations, userId?: string): CommentData {
  const reactionMap = new Map<string, { count: number; userReacted: boolean }>();
  for (const r of c.reactions) {
    const existing = reactionMap.get(r.emoji) ?? { count: 0, userReacted: false };
    existing.count++;
    if (r.userId === userId) existing.userReacted = true;
    reactionMap.set(r.emoji, existing);
  }

  return {
    id: c.id,
    content: c.content,
    episode: c.episode,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    isDeleted: c.isDeleted,
    user: c.user,
    reactions: Array.from(reactionMap.entries()).map(([emoji, data]) => ({
      emoji,
      ...data,
    })),
    replyCount: c._count.replies,
  };
}
