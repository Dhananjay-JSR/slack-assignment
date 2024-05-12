import Loader from "./Loader";
import { ProfilePanel } from "./ProfilePanel";

export function Navbar({
  isLoading,
  user,
}: {
  user: {
    user: {
      displayName: string;
    };
  } | null;
  isLoading: boolean;
}) {
  return (
    <header className="max-w-full  bg-black">
      <nav className="max-w-5xl mx-auto flex justify-between items-center py-2">
        <div className="flex items-center">
          <div className="text-white font-bold text-xl">Slack Connector</div>
        </div>
        {isLoading ? <Loader /> : <ProfilePanel user={user} />}
      </nav>
    </header>
  );
}
