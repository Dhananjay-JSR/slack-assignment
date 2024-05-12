import { useEffect, useState } from "react";
import axios, { isAxiosError } from "axios";
import { SERVER_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Link, Navigate } from "react-router-dom";
import { logout } from "../store/AuthStore";
import toast, { Toaster } from "react-hot-toast";

class AbourtError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export default function Dashboard() {
  const AuthState = useSelector((state: RootState) => state.AuthReducer);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [ChannelList, setChannelList] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [user, setUser] = useState<{
    user: {
      displayName: string;
      picture: string;
      isSlackConnected: boolean;
    };
  } | null>(null);
  const [isSlackConnected, setIsSlackConnected] = useState(false);
  useEffect(() => {
    const Controller = new AbortController();
    const signal = Controller.signal;
    (async () => {
      try {
        const response = await axios.get(SERVER_URL + "/profile", {
          signal,
          withCredentials: true,
        });
        const User = response.data as {
          user: {
            displayName: string;
            picture: string;
            isSlackConnected: boolean;
          };
        };
        setUser(User);
        if (User.user.isSlackConnected) {
          setIsSlackConnected(true);
          const ChannelResponse = await axios.get(SERVER_URL + "/channels", {
            signal,
            withCredentials: true,
          });
          setChannelList(ChannelResponse.data);
          setSelectedChannel(ChannelResponse.data[0]?.id);
          setIsLoading(false);
        } else {
          setIsSlackConnected(false);
          setIsLoading(false);
        }
      } catch (error) {
        if (error instanceof AbourtError) {
          return;
        }
        if (isAxiosError(error)) {
          if (error.response?.status === 401) {
            // Unauthorized Logout the user
            // dispatch(logout());
          }
        }
      }
    })();

    return () => {
      Controller.abort();
    };
  }, []);

  if (!AuthState.isAuthenticated) {
    return <Navigate to={"/"} />;
  }
  return (
    <>
      <div>
        <Toaster />
      </div>
      <div className="bg-black/95 h-screen flex flex-col">
        <header className="max-w-full  bg-black">
          <nav className="max-w-5xl mx-auto flex justify-between items-center py-2">
            <div className="flex items-center">
              <div className="text-white font-bold text-xl">
                Slack Connector
              </div>
            </div>
            {isLoading ? (
              <Loader />
            ) : (
              <>
                <div className="flex items-center ">
                  <div className="text-white mr-4">
                    Welcome {user?.user.displayName}
                  </div>
                  <Link
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
                    to={SERVER_URL + "/logout"}
                  >
                    Logout
                  </Link>
                </div>{" "}
              </>
            )}
            {/* <div className="flex items-center ">
            <div className="text-white mr-4">
              Welcome {AuthState.session_id}
            </div>
            <Link
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
              to={SERVER_URL + "/logout"}
            >
              Logout
            </Link>
          </div> */}
          </nav>
        </header>
        <main className="flex-grow">
          <div className="grid h-full w-full place-content-center text-white">
            {isLoading ? (
              <Loader />
            ) : isSlackConnected ? (
              <>
                <button
                  onClick={async () => {
                    const ID = toast.loading("Revoking Access");
                    try {
                      const Revoke_Request = await axios.delete(
                        SERVER_URL + "/revoke",
                        {
                          withCredentials: true,
                        }
                      );
                      if (Revoke_Request.status === 200) {
                        toast.success("Slack Access Revoked", { id: ID });
                        setIsSlackConnected(false);
                      }
                    } catch (e) {
                      if (isAxiosError(e)) {
                        if (e.response?.status === 401) {
                          dispatch(logout());
                        }
                      }
                    }
                  }}
                >
                  Revoke Access
                </button>
                <select
                  name="channels"
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="text-black"
                  id="channels"
                >
                  {ChannelList.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    const Send_Message_ID = toast.loading("Sending Message");
                    try {
                      const response = await axios.post(
                        SERVER_URL + "/send/" + selectedChannel,
                        null,
                        {
                          withCredentials: true,
                        }
                      );
                      if (response.status === 201) {
                        toast.success("Message Sent", { id: Send_Message_ID });
                      }
                    } catch (e) {
                      if (isAxiosError(e)) {
                        if (e.response?.status === 401) {
                          dispatch(logout());
                        }
                      }
                    }
                  }}
                >
                  Send Message
                </button>
              </>
            ) : (
              <a href={SERVER_URL + "/login/slack"}>Connect Slack</a>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

function Loader() {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
