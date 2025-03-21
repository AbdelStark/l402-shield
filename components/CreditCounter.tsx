"use client";
import { useEffect, useState, useRef } from "react";

interface CreditCounterProps {
  credits: number;
}

const CreditCounter: React.FC<CreditCounterProps> = ({ credits }) => {
  const [animate, setAnimate] = useState(false);
  const prevCredits = useRef(credits);

  useEffect(() => {
    // If credits increased, animate
    if (credits > prevCredits.current) {
      // Trigger animation
      setAnimate(true);
      setTimeout(() => setAnimate(false), 500);
    }

    prevCredits.current = credits;
  }, [credits]);

  return (
    <div className="flex items-center justify-center gap-2 bg-black p-3 rounded-md border border-yellow-500 shadow-[0_0_5px_#FBBF24]">
      {/* Coin icon */}
      <span
        className={`text-yellow-500 text-xl ${animate ? "coin-animation" : ""}`}
      >
        🪙
      </span>

      {/* Credits counter */}
      <span
        className={`text-yellow-400 font-bold ${
          animate ? "coin-animation" : ""
        }`}
      >
        CREDITS: {credits.toString().padStart(2, "0")}
      </span>
    </div>
  );
};

export default CreditCounter;
