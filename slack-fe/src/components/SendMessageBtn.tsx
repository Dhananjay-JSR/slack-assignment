import axios, { isAxiosError } from "axios";
import { SERVER_URL } from "../utils/base";
import { useDispatch } from "react-redux";
import { logout } from "../store/AuthStore";
import toast from "react-hot-toast";

export function SendMessageBtn({
  ChannelList,
  selectedChannel,
}: {
  selectedChannel: string;
  ChannelList: { id: string; name: string }[];
}) {
  const dispatch = useDispatch();
  return (
    <button
      disabled={ChannelList.length === 0}
      className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            toast.error("Failed to Send Message", { id: Send_Message_ID });
            if (e.response?.status === 401) {
              dispatch(logout());
            }
            if (e.response?.status === 500) {
              toast.error("Server Unreachable");
            }
          }
        }
      }}
    >
      Send Message
    </button>
  );
}
