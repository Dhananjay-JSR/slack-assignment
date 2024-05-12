import axios, { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { logout } from "../store/AuthStore";
import { SERVER_URL } from "../utils/base";
import { useDispatch } from "react-redux";

export default function RevokeAccess({
  setUser,
}: {
  setUser: React.Dispatch<
    React.SetStateAction<{
      user: {
        displayName: string;
        picture: string;
        isSlackConnected: boolean;
      };
    } | null>
  >;
}) {
  const dispatch = useDispatch();
  return (
    <button
      className="rounded-lg bg-red-600 text-white px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-50"
      onClick={async () => {
        const ID = toast.loading("Revoking Access");
        try {
          const Revoke_Request = await axios.delete(SERVER_URL + "/revoke", {
            withCredentials: true,
          });
          if (Revoke_Request.status === 200) {
            toast.success("Slack Access Revoked", { id: ID });
            setUser((prev) => {
              if (prev) {
                return {
                  user: {
                    ...prev.user,
                    isSlackConnected: false,
                  },
                };
              }
              return prev;
            });
          }
        } catch (e) {
          if (isAxiosError(e)) {
            if (e.response?.status === 401) {
              dispatch(logout());
            }
            if (e.response?.status === 500) {
              toast.error("Server Unreachable");
            }
            console.error(e.stack);
          }
        }
      }}
    >
      Revoke Access
    </button>
  );
}
