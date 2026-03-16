import { getContinueWatching } from "@/server/progress";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

export async function ContinueWatchingSection() {
  let session = null;
  try {
    session = await auth();
  } catch {
    return null;
  }
  if (!session?.user) return null;

  const items = await getContinueWatching();
  if (!items.length) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold md:text-2xl">Continue Watching</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/anime/${item.anilistId}`}
            className="group block"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              {item.anime.coverImage && (
                <Image
                  src={item.anime.coverImage}
                  alt={item.anime.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                <Play className="h-10 w-10 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-xs text-white">
                  Episode {item.currentEpisode}
                  {item.anime.episodes ? ` / ${item.anime.episodes}` : ""}
                </p>
                {item.anime.episodes && (
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(item.currentEpisode / item.anime.episodes) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
            <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-tight group-hover:text-primary">
              {item.anime.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
