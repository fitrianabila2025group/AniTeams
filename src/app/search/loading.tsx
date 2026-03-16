import { AnimeGridSkeleton } from "@/components/anime-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-6 h-10 w-48" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[140px]" />
      </div>
      <div className="mt-8">
        <AnimeGridSkeleton count={24} />
      </div>
    </div>
  );
}
