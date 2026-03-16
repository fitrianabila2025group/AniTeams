import { providers } from "@/providers";
import { ExternalLink, Tv } from "lucide-react";

interface StreamingLinksProps {
  anilistId: number;
}

export async function StreamingLinks({ anilistId }: StreamingLinksProps) {
  const streamingProviders = providers.getStreamingProviders();

  const results = await Promise.all(
    streamingProviders.map((p) => p.getStreamingLinks(anilistId)),
  );

  const allLinks = results.flatMap((r) => (r.success ? r.data ?? [] : []));

  if (allLinks.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Tv className="h-5 w-5" />
          <span className="text-sm">No legal streaming links available for your region.</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          You can still add this anime to your watchlist and track your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="mb-3 text-lg font-semibold">Watch Legally</h2>
      <div className="flex flex-wrap gap-2">
        {allLinks.map((link) => (
          <a
            key={`${link.provider}-${link.url}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 transition-colors hover:bg-secondary"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-sm font-medium">{link.provider}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
