export async function generateMetadata({ params }) {
  const { id } = await params;
  const title = id
    .replace(/-\d+$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `Watch ${title}`,
    description: `Watch ${title} online for free with subtitles in HD quality on AniTeams.`,
    alternates: {
      canonical: `/watch/${id}`,
    },
    openGraph: {
      title: `Watch ${title} | AniTeams`,
      description: `Stream ${title} for free on AniTeams.`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function WatchLayout({ children }) {
  return children;
}
