"use client";
import { useEffect, useState } from "react";
import { BlockData } from "../utils/api";
import { ExternalLink } from "lucide-react";

interface BlockInfoProps {
  blockData: BlockData | null;
  isLoading?: boolean;
}

const BlockInfo: React.FC<BlockInfoProps> = ({
  blockData,
  isLoading = false,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (blockData?.hash) {
      setVisible(true);
    }
  }, [blockData]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="mt-6 p-4 bg-black border-2 border-cyan-500 shadow-[0_0_10px_#06B6D4] rounded-md scanlines">
        <h3 className="text-cyan-400 mb-3 text-center">LATEST BITCOIN BLOCK</h3>
        <div className="font-mono text-sm text-green-400 text-center space-y-4 py-2">
          <div className="loading-dots flex justify-center items-center space-x-2">
            <span className="h-3 w-3 bg-green-400 rounded-full animate-pulse delay-0"></span>
            <span className="h-3 w-3 bg-green-400 rounded-full animate-pulse delay-150"></span>
            <span className="h-3 w-3 bg-green-400 rounded-full animate-pulse delay-300"></span>
          </div>
          <p className="blink-text text-xs">ACCESSING BLOCKCHAIN DATA</p>
        </div>
      </div>
    );
  }

  if (!blockData?.hash || !visible) {
    return null;
  }

  const shortenedHash =
    blockData.hash.length > 20
      ? `${blockData.hash.substring(0, 10)}...${blockData.hash.substring(
          blockData.hash.length - 10,
        )}`
      : blockData.hash;

  const explorerUrl = `https://mempool.space/block/${blockData.hash}`;

  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-6 p-4 bg-black border-2 border-cyan-500 shadow-[0_0_10px_#06B6D4] rounded-md scanlines hover:border-cyan-400 hover:shadow-[0_0_15px_#06B6D4] transition-all duration-300"
    >
      <h3 className="text-cyan-400 mb-3 text-center">LATEST BITCOIN BLOCK</h3>
      <div className="space-y-2 font-mono text-sm text-green-400 text-center">
        <p className="typewriter">HEIGHT: #{blockData.height}</p>
        <p className="typewriter">HASH: {shortenedHash}</p>
        <p className="typewriter">TIME: {blockData.timestamp}</p>
      </div>
      <div className="mt-4 flex items-center justify-center text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors">
        <span>VIEW IN EXPLORER</span>
        <ExternalLink size={12} className="ml-1" />
      </div>
    </a>
  );
};

export default BlockInfo;
