import { Skeleton } from "@/components/ui/skeleton";

export function AnimeCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <Skeleton className="mt-1 h-3 w-1/2" />
    </div>
  );
}

export function AnimeGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}
