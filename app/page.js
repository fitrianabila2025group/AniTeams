import Hero from './components/hero';
import Header from './components/Header';
import AnimeSelector from "./components/AnimeSelector";
import GenreQuickAccess from './components/GenreQuickAccess';
import OnAir from './components/OnAir';
import ResumeWatching from './components/ResumeWatching';

export const metadata = {
  title: "AniTeams - Watch Anime Online for Free",
  description:
    "Watch anime online for free in HD quality. Stream the latest and most popular anime series and movies with subtitles on AniTeams.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <main>
      <Hero />  
      <Header />
      <GenreQuickAccess />
      <ResumeWatching />  
      <AnimeSelector />
      <OnAir />
    </main>
  );
}
