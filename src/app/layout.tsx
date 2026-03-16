import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aniteams.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AniTeams — Watch Anime Online for Free",
    template: "%s | AniTeams",
  },
  description:
    "Watch anime online for free in HD quality. Stream thousands of anime series and movies with subtitles on AniTeams.",
  keywords: [
    "anime",
    "watch anime",
    "anime streaming",
    "anime online",
    "free anime",
    "anime sub",
    "anime dub",
    "anime HD",
    "AniTeams",
  ],
  authors: [{ name: "AniTeams" }],
  creator: "AniTeams",
  publisher: "AniTeams",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "AniTeams",
    title: "AniTeams — Watch Anime Online for Free",
    description:
      "Watch anime online for free in HD quality. Stream thousands of anime series and movies with subtitles on AniTeams.",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "AniTeams",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AniTeams — Watch Anime Online for Free",
    description:
      "Watch anime online for free in HD quality. Stream thousands of anime series and movies with subtitles.",
    images: ["/icons/icon-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // other: { "msvalidate.01": "your-bing-verification-code" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AniTeams",
    url: SITE_URL,
    description:
      "Watch anime online for free in HD quality. Stream thousands of anime series and movies with subtitles on AniTeams.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
