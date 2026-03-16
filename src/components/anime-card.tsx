import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { AnimeMedia } from "@/types";

interface AnimeCardProps {
  anime: AnimeMedia;
  priority?: boolean;
}

export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  const title = anime.title.english ?? anime.title.romaji;
  const cover = anime.coverImage?.large ?? anime.coverImage?.medium;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;

  return (
    <Link href={`/anime/${anime.id}`} className="group block" prefetch={false}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        {score && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {score}
          </div>
        )}
        {anime.format && (
          <div className="absolute right-2 top-2 rounded-md bg-primary/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {anime.format.replace("_", " ")}
          </div>
        )}
        {anime.nextAiringEpisode && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <p className="text-xs text-green-400">
              Ep {anime.nextAiringEpisode.episode} airing soon
            </p>
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight group-hover:text-primary">
          {title}
        </h3>
        {anime.season && anime.seasonYear && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {anime.season} {anime.seasonYear}
          </p>
        )}
      </div>
    </Link>
  );
}
