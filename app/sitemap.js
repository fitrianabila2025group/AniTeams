const SITE_URL = process.env.NEXT_PUBLIC_DEPLOYMENT_URL || 'https://aniteams.com';

export default function sitemap() {
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const genres = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
    "Isekai", "Mecha", "Music", "Mystery", "Psychological", "Romance",
    "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
    "Ecchi", "Mahou Shoujo", "School", "Shoujo", "Shounen",
  ];

  const genrePages = genres.map((genre) => ({
    url: `${SITE_URL}/genre/${encodeURIComponent(genre)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...genrePages];
}
