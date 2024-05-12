import { SERVER_URL } from "../utils/base";

export default function ConnectWithSlack() {
  return (
    <a
      href={SERVER_URL + "/login/slack"}
      className="bg-green-400 text-black text-2xl px-2 py-1.5 rounded-lg"
    >
      Connect Slack
    </a>
  );
}
