import { SERVER_URL } from "../utils/base";

export function ProfilePanel({
  user,
}: {
  user: {
    user: {
      displayName: string;
      picture: string;
    };
  } | null;
}) {
  return (
    <>
      <div className="flex items-center gap-4 ">
        <div className="text-white  ">Welcome {user?.user.displayName}</div>
        <div>
          <img
            src={user?.user.picture}
            alt="Profile Picture"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full"
          />
        </div>
        <a
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
          href={SERVER_URL + "/logout"}
        >
          Logout
        </a>
      </div>
    </>
  );
}
