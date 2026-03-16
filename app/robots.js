const SITE_URL = process.env.NEXT_PUBLIC_DEPLOYMENT_URL || 'https://aniteams.com';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/callback',
          '/account',
          '/profile',
          '/_not-found',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
