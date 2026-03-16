import { Skeleton } from "@/components/ui/skeleton";

export default function AnimeDetailLoading() {
  return (
    <div>
      <Skeleton className="h-64 w-full" />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <Skeleton className="mx-auto h-72 w-48 rounded-lg md:-mt-20 md:w-56" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
