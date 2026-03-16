import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SearchPaginationProps {
  pageInfo: {
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
  };
  currentFilters: Record<string, string | undefined>;
}

export function SearchPagination({ pageInfo, currentFilters }: SearchPaginationProps) {
  function buildUrl(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(currentFilters)) {
      if (value && key !== "page") params.set(key, value);
    }
    params.set("page", page.toString());
    return `/search?${params.toString()}`;
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {pageInfo.currentPage > 1 && (
        <Link href={buildUrl(pageInfo.currentPage - 1)}>
          <Button variant="outline" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
        </Link>
      )}

      <span className="px-4 text-sm text-muted-foreground">
        Page {pageInfo.currentPage} of {pageInfo.lastPage}
      </span>

      {pageInfo.hasNextPage && (
        <Link href={buildUrl(pageInfo.currentPage + 1)}>
          <Button variant="outline" size="sm" className="gap-1">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}
