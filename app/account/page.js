import AccountPage from './AccountPage';
import Eruda from '@components/Eruda';

export const metadata = {
  title: "My Account",
  description: "Manage your AniTeams account, watchlist, and settings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <>
      <AccountPage />
      <Eruda />
    </>
  );
}
