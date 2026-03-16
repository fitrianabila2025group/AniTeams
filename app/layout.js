
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "./components/client/ClientLayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_DEPLOYMENT_URL || "https://aniteams.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AniTeams - Watch Anime Online for Free",
    template: "%s | AniTeams",
  },
  description:
    "Watch anime online for free in HD quality. Stream thousands of anime series and movies with subtitles on AniTeams.",
  keywords: [
    "anime", "watch anime", "anime streaming", "anime online", "free anime",
    "anime sub", "anime dub", "anime HD", "AniTeams",
  ],
  authors: [{ name: "AniTeams" }],
  creator: "AniTeams",
  publisher: "AniTeams",
  themeColor: "#000000",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AniTeams",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "AniTeams",
    title: "AniTeams - Watch Anime Online for Free",
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
    title: "AniTeams - Watch Anime Online for Free",
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
    // Add your verification codes here when you have them:
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // other: { "msvalidate.01": "your-bing-verification-code" },
  },
};

export default function RootLayout({ children }) {
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
