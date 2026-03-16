export async function generateMetadata({ params }) {
  const { id } = await params;
  const genre = decodeURIComponent(id);

  return {
    title: `${genre} Anime`,
    description: `Browse the best ${genre} anime series and movies. Discover top-rated ${genre} anime to watch for free on AniTeams.`,
    alternates: {
      canonical: `/genre/${id}`,
    },
    openGraph: {
      title: `${genre} Anime | AniTeams`,
      description: `Browse the best ${genre} anime series and movies on AniTeams.`,
    },
  };
}

export default function GenreLayout({ children }) {
  return children;
}
