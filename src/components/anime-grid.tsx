import { AnimeCard } from "@/components/anime-card";
import type { AnimeMedia } from "@/types";

interface AnimeGridProps {
  anime: AnimeMedia[];
  title: string;
  viewAllHref?: string;
}

export function AnimeGrid({ anime, title, viewAllHref }: AnimeGridProps) {
  if (!anime.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
        {viewAllHref && (
          <a href={viewAllHref} className="text-sm text-primary hover:underline">
            View All
          </a>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {anime.map((item, i) => (
          <AnimeCard key={item.id} anime={item} priority={i < 6} />
        ))}
      </div>
    </section>
  );
}
