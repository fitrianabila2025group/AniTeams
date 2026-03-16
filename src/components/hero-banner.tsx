import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Star } from "lucide-react";
import type { AnimeMedia } from "@/types";

interface HeroBannerProps {
  anime: AnimeMedia;
}

export function HeroBanner({ anime }: HeroBannerProps) {
  const title = anime.title.english ?? anime.title.romaji;
  const banner = anime.bannerImage ?? anime.coverImage?.extraLarge;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const description = anime.description
    ?.replace(/<[^>]*>/g, "")
    .slice(0, 300);

  return (
    <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden md:h-[70vh]">
      {banner && (
        <Image
          src={banner}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
        <div className="container mx-auto max-w-6xl">
          {score && (
            <div className="mb-3 flex items-center gap-1 text-yellow-400">
              <Star className="h-4 w-4 fill-yellow-400" />
              <span className="text-sm font-medium">{score}</span>
            </div>
          )}
          <h1 className="mb-3 text-3xl font-bold md:text-5xl">{title}</h1>
          <div className="mb-4 flex flex-wrap gap-2">
            {anime.genres?.slice(0, 4).map((genre) => (
              <Badge key={genre} variant="secondary">{genre}</Badge>
            ))}
            {anime.format && (
              <Badge variant="outline">{anime.format.replace("_", " ")}</Badge>
            )}
            {anime.episodes && (
              <Badge variant="outline">{anime.episodes} episodes</Badge>
            )}
          </div>
          {description && (
            <p className="mb-6 max-w-xl text-sm text-muted-foreground md:text-base">
              {description}...
            </p>
          )}
          <div className="flex gap-3">
            <Link href={`/anime/${anime.id}`}>
              <Button size="lg" className="gap-2">
                <Play className="h-4 w-4" /> Watch Now
              </Button>
            </Link>
            <Link href={`/anime/${anime.id}`}>
              <Button size="lg" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
