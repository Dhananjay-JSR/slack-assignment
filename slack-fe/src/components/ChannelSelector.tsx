export function ChannelSelector({
  ChannelList,
  selectedChannel,
  setSelectedChannel,
}: {
  selectedChannel: string;
  setSelectedChannel: React.Dispatch<React.SetStateAction<string>>;
  ChannelList: { id: string; name: string }[];
}) {
  return (
    <div className="text-lg flex gap-3 items-center">
      <label htmlFor="channels">Select Channel</label>
      <select
        className="rounded-lg p-2 text-black bg-white w-40"
        name="channels"
        value={selectedChannel}
        onChange={(e) => setSelectedChannel(e.target.value)}
        id="channels"
      >
        {ChannelList.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.name}
          </option>
        ))}
      </select>
    </div>
  );
}
