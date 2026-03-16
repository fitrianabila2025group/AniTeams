"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ANILIST_API = "https://graphql.anilist.co";
const ANILIST_OAUTH_URL = "https://anilist.co/api/v2/oauth/token";

export async function getAniListAuthUrl() {
  const clientId = process.env.ANILIST_CLIENT_ID;
  const redirectUri = process.env.ANILIST_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return null;
  }
  return `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
}

export async function connectAniList(code: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = z.string().min(1).max(500).parse(code);

  const clientId = process.env.ANILIST_CLIENT_ID;
  const clientSecret = process.env.ANILIST_CLIENT_SECRET;
  const redirectUri = process.env.ANILIST_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("AniList OAuth not configured");
  }

  // Exchange code for token
  const tokenResponse = await fetch(ANILIST_OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code: parsed,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to exchange code for token");
  }

  const tokenData = await tokenResponse.json();
  const accessToken: string = tokenData.access_token;

  // Get AniList user info
  const userResponse = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: "query { Viewer { id name } }",
    }),
  });

  if (!userResponse.ok) {
    throw new Error("Failed to get AniList user info");
  }

  const userData = await userResponse.json();
  const anilistId: number = userData.data.Viewer.id;

  // Store connection
  await db.aniListConnection.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      anilistId,
      accessToken,
      syncEnabled: true,
    },
    update: {
      anilistId,
      accessToken,
      syncEnabled: true,
    },
  });

  return { success: true, anilistId };
}

export async function disconnectAniList() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.aniListConnection.deleteMany({
    where: { userId: session.user.id },
  });

  return { success: true };
}

export async function syncWatchlistToAniList() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const connection = await db.aniListConnection.findUnique({
    where: { userId: session.user.id },
  });
  if (!connection || !connection.syncEnabled) {
    throw new Error("AniList not connected");
  }

  // Get local watchlist
  const entries = await db.watchlistEntry.findMany({
    where: { userId: session.user.id },
    include: { anime: { select: { anilistId: true } } },
  });

  const statusMap: Record<string, string> = {
    WATCHING: "CURRENT",
    COMPLETED: "COMPLETED",
    PLANNING: "PLANNING",
    DROPPED: "DROPPED",
    ON_HOLD: "PAUSED",
  };

  const mutation = `
    mutation ($mediaId: Int, $status: MediaListStatus, $score: Float) {
      SaveMediaListEntry(mediaId: $mediaId, status: $status, score: $score) { id }
    }
  `;

  let synced = 0;
  for (const entry of entries) {
    try {
      await fetch(ANILIST_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${connection.accessToken}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            mediaId: entry.anime.anilistId,
            status: statusMap[entry.status] ?? "PLANNING",
            score: entry.score ? entry.score / 10 : null,
          },
        }),
      });
      synced++;
    } catch {
      // Continue syncing other entries
    }
  }

  await db.aniListConnection.update({
    where: { userId: session.user.id },
    data: { lastSyncAt: new Date() },
  });

  return { success: true, synced };
}

export async function getAniListConnection() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const connection = await db.aniListConnection.findUnique({
    where: { userId: session.user.id },
    select: {
      anilistId: true,
      syncEnabled: true,
      lastSyncAt: true,
    },
  });

  return connection;
}
