import { SERVER_URL } from "../utils/base";
import { Link } from "react-router-dom";

export function ProfilePanel({
  user,
}: {
  user: {
    user: {
      displayName: string;
    };
  } | null;
}) {
  return (
    <>
      <div className="flex items-center ">
        <div className="text-white mr-4">Welcome {user?.user.displayName}</div>
        <Link
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
          to={SERVER_URL + "/logout"}
        >
          Logout
        </Link>
      </div>
    </>
  );
}
