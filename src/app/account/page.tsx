import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import { getWatchlist } from "@/server/watchlist";
import { WatchlistTabs } from "@/components/watchlist-tabs";

export const metadata: Metadata = {
  title: "My Watchlist",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await requireAuth();

  const watchlist = await getWatchlist();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">My Watchlist</h1>
      <WatchlistTabs entries={watchlist} userId={session.user.id} />
    </div>
  );
}
