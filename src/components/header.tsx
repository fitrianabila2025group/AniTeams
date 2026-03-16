import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function Header() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // Auth may fail if DB is not configured yet
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">AT</span>
            </div>
            <span className="text-lg font-bold">AniTeams</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Home
            </Link>
            <Link href="/search" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Browse
            </Link>
            {session && (
              <Link href="/account" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                My List
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/search">
            <Button variant="ghost" size="icon" aria-label="Search anime">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
