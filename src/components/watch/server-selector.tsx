"use client";

import { cn } from "@/lib/utils";

interface Server {
  serverId: number;
  serverName: string;
}

interface ServerSelectorProps {
  sub: Server[];
  dub: Server[];
  raw: Server[];
  activeCategory: "sub" | "dub" | "raw";
  activeServer: string;
  onCategoryChange: (category: "sub" | "dub" | "raw") => void;
  onServerChange: (serverName: string) => void;
}

const categoryLabels = {
  sub: "SUB",
  dub: "DUB",
  raw: "RAW",
};

export function ServerSelector({
  sub,
  dub,
  raw,
  activeCategory,
  activeServer,
  onCategoryChange,
  onServerChange,
}: ServerSelectorProps) {
  const categories = [
    { key: "sub" as const, servers: sub },
    { key: "dub" as const, servers: dub },
    { key: "raw" as const, servers: raw },
  ].filter((c) => c.servers.length > 0);

  const currentServers =
    activeCategory === "sub" ? sub : activeCategory === "dub" ? dub : raw;

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              onCategoryChange(cat.key);
              if (cat.servers.length > 0) {
                onServerChange(cat.servers[0].serverName);
              }
            }}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              activeCategory === cat.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {categoryLabels[cat.key]}
          </button>
        ))}
      </div>

      {/* Server buttons */}
      <div className="flex flex-wrap gap-2">
        {currentServers.map((server) => (
          <button
            key={server.serverId}
            onClick={() => onServerChange(server.serverName)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              activeServer === server.serverName
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-secondary"
            )}
          >
            {server.serverName}
          </button>
        ))}
      </div>
    </div>
  );
}
