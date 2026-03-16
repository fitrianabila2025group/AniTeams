import AnimeSearch from "./AnimeSearch";

export const metadata = {
  title: "Search Anime",
  description:
    "Search and discover thousands of anime series and movies. Find your next favorite anime to watch on AniTeams.",
  alternates: {
    canonical: "/search",
  },
};

export default function SearchPage() {
  return <AnimeSearch />;
}
