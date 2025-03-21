"use client";
import { useEffect, useState } from "react";
import { BlockData } from "../utils/api";
import { Search } from "lucide-react";

interface BlockInfoProps {
  blockData: BlockData | null;
}

const BlockInfo: React.FC<BlockInfoProps> = ({ blockData }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (blockData?.hash) {
      setVisible(true);

      // Optional - play a success sound when block data is received
      const audio = new Audio("/sounds/success.mp3");
      audio.volume = 0.3;
      audio.play().catch((err) => console.log("Audio play error:", err));
    }
  }, [blockData]);

  if (!blockData?.hash || !visible) {
    return null;
  }

  const shortenedHash =
    blockData.hash.length > 20
      ? `${blockData.hash.substring(0, 10)}...${blockData.hash.substring(
          blockData.hash.length - 10,
        )}`
      : blockData.hash;

  return (
    <div className="mt-6 p-4 bg-black border-2 border-cyan-500 shadow-[0_0_10px_#06B6D4] rounded-md scanlines">
      <h3 className="text-cyan-400 mb-3 text-center">LATEST BITCOIN BLOCK</h3>
      <div className="space-y-2 font-mono text-sm text-green-400">
        <p className="typewriter">HEIGHT: #{blockData.height}</p>
        <div className="flex items-center gap-2">
          <p className="typewriter">HASH: {shortenedHash}</p>
          <a
            href={`https://mempool.space/block/${blockData.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
            title="View in Block Explorer"
          >
            <Search size={16} />
          </a>
        </div>
        <p className="typewriter">TIME: {blockData.timestamp}</p>
      </div>
    </div>
  );
};

export default BlockInfo;
