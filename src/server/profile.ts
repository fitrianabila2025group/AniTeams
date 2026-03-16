"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getProfile(userId?: string) {
  const session = await auth();
  const targetId = userId ?? session?.user?.id;
  if (!targetId) return null;

  const user = await db.user.findUnique({
    where: { id: targetId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      role: true,
      createdAt: true,
      settings: { select: { publicProfile: true } },
      _count: {
        select: {
          watchlistEntries: true,
          comments: true,
          progressEntries: true,
        },
      },
    },
  });

  if (!user) return null;

  // Hide email for non-self profiles
  const isSelf = session?.user?.id === user.id;
  if (!isSelf && !user.settings?.publicProfile) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: isSelf ? user.email : null,
    image: user.image,
    bio: user.bio,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    stats: {
      watchlist: user._count.watchlistEntries,
      comments: user._count.comments,
      progress: user._count.progressEntries,
    },
  };
}

export async function updateProfile(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = profileUpdateSchema.parse(input);

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.name,
      bio: parsed.bio,
      image: parsed.image,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}
