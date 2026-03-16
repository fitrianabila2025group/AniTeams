import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-white">AT</span>
              </div>
              <span className="text-lg font-bold">AniTeams</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Discover, track, and discuss your favorite anime. Built with love for the anime community.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Explore</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground">Browse Anime</Link>
              <Link href="/search?season=WINTER&year=2026" className="text-sm text-muted-foreground hover:text-foreground">This Season</Link>
              <Link href="/search?sort=TRENDING_DESC" className="text-sm text-muted-foreground hover:text-foreground">Trending</Link>
              <Link href="/search?sort=POPULARITY_DESC" className="text-sm text-muted-foreground hover:text-foreground">Popular</Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Account</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">My Watchlist</Link>
              <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground">Profile</Link>
              <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground">Settings</Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AniTeams. Anime metadata provided by AniList.
          </p>
        </div>
      </div>
    </footer>
  );
}
