import { AnimeGridSkeleton } from "@/components/anime-card-skeleton";

export default function HomeLoading() {
  return (
    <div>
      <div className="h-[70vh] animate-pulse bg-muted" />
      <div className="container mx-auto space-y-12 px-4 py-12">
        <AnimeGridSkeleton count={12} />
        <AnimeGridSkeleton count={12} />
      </div>
    </div>
  );
}
