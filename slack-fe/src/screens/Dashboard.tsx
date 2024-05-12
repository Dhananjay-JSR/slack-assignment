import { useEffect, useState } from "react";
import axios, { isAxiosError } from "axios";
import { SERVER_URL } from "../utils/base";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Navigate } from "react-router-dom";
import { logout } from "../store/AuthStore";
import toast, { Toaster } from "react-hot-toast";
import Loader from "../components/Loader";
import { Navbar } from "../components/Navbar";
import RevokeAccess from "../components/RevokeAccessBtn";
import { SendMessageBtn } from "../components/SendMessageBtn";
import { ChannelSelector } from "../components/ChannelSelector";
import ConnectWithSlack from "../components/ConnectWithSlackBtn";

export default function Dashboard() {
  // Keep Track of Auth State
  const AuthState = useSelector((state: RootState) => state.AuthReducer);
  const dispatch = useDispatch();
  // Keep Track of Loading State
  const [isLoading, setIsLoading] = useState(true);
  // Keep Track of Channel List
  const [ChannelList, setChannelList] = useState<
    { id: string; name: string }[]
  >([]);
  // Keep Track of Selected Channel
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  // Keep Track of User
  const [user, setUser] = useState<{
    user: {
      displayName: string;
      picture: string;
      isSlackConnected: boolean;
    };
  } | null>(null);

  useEffect(() => {
    const Controller = new AbortController();
    const signal = Controller.signal;
    (async () => {
      try {
        // Fetch User Profile
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
          // if Slack is Connected Fetch Channel List
          const ChannelResponse = await axios.get(SERVER_URL + "/channels", {
            signal,
            withCredentials: true,
          });
          setChannelList(ChannelResponse.data);
          setSelectedChannel(ChannelResponse.data[0]?.id);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.message);
          if (error.response?.status === 401) {
            dispatch(logout());
            return;
          }
          if (error.response?.status === 500) {
            toast.error("Server Unreachable");
            return;
          }
        }
      }
    })();

    return () => {
      Controller.abort();
    };
  }, []);

  if (!AuthState.isAuthenticated) {
    // Redirect to Login if not Authenticated
    return <Navigate to={"/"} />;
  }
  return (
    <>
      <div>
        <Toaster />
      </div>
      <div className="bg-black/95 h-screen flex flex-col">
        <Navbar isLoading={isLoading} user={user} />
        <main className="flex-grow">
          <div className="grid h-full w-full place-content-center text-white">
            {isLoading ? (
              <Loader />
            ) : user?.user.isSlackConnected ? (
              <div className="gap-4 flex flex-col ">
                <RevokeAccess setUser={setUser} />
                <ChannelSelector
                  ChannelList={ChannelList}
                  selectedChannel={selectedChannel}
                  setSelectedChannel={setSelectedChannel}
                />
                <SendMessageBtn
                  ChannelList={ChannelList}
                  selectedChannel={selectedChannel}
                />
              </div>
            ) : (
              <ConnectWithSlack />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
