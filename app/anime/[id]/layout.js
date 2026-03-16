const CONSUMET_URL = process.env.NEXT_PUBLIC_CONSUMET_BASE_URL;

async function getAnimeInfo(id) {
  try {
    const res = await fetch(`${CONSUMET_URL}/meta/anilist/data/${id}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error("API failed");
    return await res.json();
  } catch {
    try {
      const res = await fetch(
        `https://hianime-mapper-iv3g.vercel.app/anime/info/${id}`,
        { next: { revalidate: 86400 } }
      );
      const data = await res.json();
      return data.data || null;
    } catch {
      return null;
    }
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const anime = await getAnimeInfo(id);

  if (!anime) {
    return {
      title: "Anime Details",
      description: "Watch this anime for free on AniTeams.",
    };
  }

  const title = anime.title?.english || anime.title?.romaji || "Anime";
  const description =
    anime.description
      ?.replace(/<[^>]*>/g, "")
      ?.replace(/\n/g, " ")
      ?.slice(0, 160) || `Watch ${title} online for free on AniTeams.`;
  const image = anime.image || anime.cover || null;

  return {
    title,
    description,
    alternates: {
      canonical: `/anime/${id}`,
    },
    openGraph: {
      title: `${title} | AniTeams`,
      description,
      type: "video.tv_show",
      ...(image && {
        images: [
          {
            url: image,
            width: 460,
            height: 650,
            alt: title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | AniTeams`,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function AnimeLayout({ children, params }) {
  const { id } = await params;
  const anime = await getAnimeInfo(id);

  const title = anime?.title?.english || anime?.title?.romaji || "Anime";
  const description =
    anime?.description?.replace(/<[^>]*>/g, "")?.replace(/\n/g, " ")?.slice(0, 300) || "";
  const image = anime?.image || anime?.cover || null;

  const jsonLd = anime
    ? {
        "@context": "https://schema.org",
        "@type": "TVSeries",
        name: title,
        description,
        ...(image && { image }),
        genre: anime.genres || [],
        ...(anime.releaseDate && { datePublished: String(anime.releaseDate) }),
        ...(anime.rating && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: anime.rating / 10,
            bestRating: 10,
          },
        }),
        ...(anime.totalEpisodes && {
          numberOfEpisodes: anime.totalEpisodes,
        }),
        ...(anime.status && { status: anime.status }),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
