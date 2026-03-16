"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Link as LinkIcon, Unlink, RefreshCw } from "lucide-react";
import { disconnectAniList, syncWatchlistToAniList } from "@/server/anilist-sync";

interface AniListConnectProps {
  connection: {
    anilistId: number;
    syncEnabled: boolean;
    lastSyncAt: string | null;
  } | null;
  authUrl: string | null;
}

export function AniListConnect({ connection, authUrl }: AniListConnectProps) {
  const [isPending, startTransition] = useTransition();
  const [syncResult, setSyncResult] = useState<string | null>(null);

  function handleDisconnect() {
    startTransition(async () => {
      await disconnectAniList();
      window.location.reload();
    });
  }

  function handleSync() {
    startTransition(async () => {
      try {
        const result = await syncWatchlistToAniList();
        setSyncResult(`Synced ${result.synced} entries to AniList`);
        setTimeout(() => setSyncResult(null), 3000);
      } catch {
        setSyncResult("Sync failed. Please try again.");
      }
    });
  }

  if (connection) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-sm">Connected to AniList (ID: {connection.anilistId})</span>
        </div>
        {connection.lastSyncAt && (
          <p className="text-xs text-muted-foreground">
            Last synced: {new Date(connection.lastSyncAt).toLocaleString()}
          </p>
        )}
        {syncResult && (
          <p className="text-sm text-primary">{syncResult}</p>
        )}
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={isPending} size="sm" className="gap-2">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync Now
          </Button>
          <Button onClick={handleDisconnect} disabled={isPending} variant="outline" size="sm" className="gap-2">
            <Unlink className="h-4 w-4" /> Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Connect your AniList account to sync your watchlist and progress.
      </p>
      {authUrl ? (
        <a href={authUrl}>
          <Button size="sm" className="gap-2">
            <LinkIcon className="h-4 w-4" /> Connect AniList
          </Button>
        </a>
      ) : (
        <p className="text-xs text-muted-foreground">
          AniList OAuth is not configured. Set ANILIST_CLIENT_ID and ANILIST_CLIENT_SECRET in your environment.
        </p>
      )}
    </div>
  );
}
