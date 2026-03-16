"use client";

import { useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Trash2, ChevronDown, Loader2 } from "lucide-react";
import { createComment, deleteComment, toggleReaction, getComments, getReplies } from "@/server/comments";
import type { CommentData } from "@/types";
import { useEffect, useCallback } from "react";

import Link from "next/link";

interface CommentSectionProps {
  anilistId: number;
  episode?: number | null;
  isLoggedIn?: boolean;
}

export function CommentSection({ anilistId, episode, isLoggedIn = false }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadComments = useCallback(async () => {
    try {
      const result = await getComments(anilistId, episode ?? null, page);
      setComments(result.comments);
      setTotal(result.total);
    } catch {
      // Not available
    }
  }, [anilistId, episode, page]);

  useEffect(() => {
    setComments([]);
    setTotal(0);
    setPage(1);
    loadComments();
  }, [anilistId, episode, loadComments]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    startTransition(async () => {
      try {
        const comment = await createComment({
          animeAnilistId: anilistId,
          content: newComment.trim(),
          episode: episode ?? undefined,
        });
        setComments((prev) => [comment, ...prev]);
        setTotal((t) => t + 1);
        setNewComment("");
      } catch {
        // Handle error (not logged in, etc.)
      }
    });
  }

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="h-5 w-5" />
        Comments ({total})
      </h2>

      {/* New comment form */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this anime..."
              className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={3}
              maxLength={5000}
            />
          </div>
          <div className="mt-2 flex justify-end">
            <Button type="submit" size="sm" disabled={isPending || !newComment.trim()} className="gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Post
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-lg border border-border bg-card p-4 text-center">
          <p className="text-sm text-muted-foreground">
            You must be{" "}
            <Link href="/login" className="text-primary hover:underline">
              logged in
            </Link>{" "}
            to post a comment.
          </p>
        </div>
      )}

      {/* Comment list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} anilistId={anilistId} isLoggedIn={isLoggedIn} onDelete={(id) => {
            setComments((prev) => prev.filter((c) => c.id !== id));
            setTotal((t) => t - 1);
          }} />
        ))}
      </div>

      {/* Load more */}
      {comments.length < total && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            className="gap-1"
          >
            <ChevronDown className="h-4 w-4" /> Load More
          </Button>
        </div>
      )}

      {total === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
}

// ─── Single Comment ─────────────────────────────────────

interface CommentItemProps {
  comment: CommentData;
  anilistId: number;
  isLoggedIn: boolean;
  onDelete: (id: string) => void;
}

function CommentItem({ comment, anilistId, isLoggedIn, onDelete }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentData[]>([]);
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initials = comment.user.name?.slice(0, 2).toUpperCase() ?? "U";
  const timeAgo = formatTimeAgo(comment.createdAt);

  async function loadReplies() {
    if (!showReplies) {
      const data = await getReplies(comment.id);
      setReplies(data);
    }
    setShowReplies(!showReplies);
  }

  function handleReply() {
    if (!replyText.trim()) return;
    startTransition(async () => {
      try {
        const reply = await createComment({
          animeAnilistId: anilistId,
          content: replyText.trim(),
          parentId: comment.id,
        });
        setReplies((prev) => [...prev, reply]);
        setReplyText("");
        setShowReplyForm(false);
        setShowReplies(true);
      } catch {
        // Handle error
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteComment(comment.id);
        onDelete(comment.id);
      } catch {
        // Handle error
      }
    });
  }

  function handleReaction(emoji: string) {
    // Optimistic update
    const existingIdx = comment.reactions.findIndex((r) => r.emoji === emoji);
    const updatedReactions = [...comment.reactions];
    if (existingIdx >= 0) {
      const existing = updatedReactions[existingIdx];
      if (existing.userReacted) {
        existing.count -= 1;
        existing.userReacted = false;
        if (existing.count <= 0) updatedReactions.splice(existingIdx, 1);
      } else {
        existing.count += 1;
        existing.userReacted = true;
      }
    } else {
      updatedReactions.push({ emoji, count: 1, userReacted: true });
    }
    comment.reactions = updatedReactions;

    startTransition(async () => {
      await toggleReaction({ commentId: comment.id, emoji });
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.image ?? undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.user.name ?? "Anonymous"}</span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
          <p className="mt-1 text-sm whitespace-pre-wrap">{comment.content}</p>

          {/* Actions */}
          <div className="mt-2 flex items-center gap-2">
            {comment.reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => handleReaction(r.emoji)}
                className={`rounded-full border px-2 py-0.5 text-xs ${
                  r.userReacted ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                {r.emoji} {r.count}
              </button>
            ))}
            <button onClick={() => handleReaction("👍")} className="rounded-full border border-border px-2 py-0.5 text-xs hover:bg-secondary">
              👍
            </button>
            {isLoggedIn && (
              <button onClick={() => setShowReplyForm(!showReplyForm)} className="text-xs text-muted-foreground hover:text-foreground">
                Reply
              </button>
            )}
            {isLoggedIn && (
              <button onClick={handleDelete} className="text-xs text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
            {(comment.replyCount ?? 0) > 0 && (
              <button onClick={loadReplies} className="text-xs text-primary hover:underline">
                {showReplies ? "Hide" : "Show"} {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                maxLength={5000}
              />
              <Button size="sm" onClick={handleReply} disabled={isPending}>
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Reply"}
              </Button>
            </div>
          )}

          {/* Replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-3 space-y-3 border-l-2 border-border pl-4">
              {replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} anilistId={anilistId} isLoggedIn={isLoggedIn} onDelete={(id) => {
                  setReplies((prev) => prev.filter((r) => r.id !== id));
                }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
