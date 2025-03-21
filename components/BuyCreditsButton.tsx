"use client";
import { PlusCircle } from "lucide-react";

interface BuyCreditsButtonProps {
  onBuyCredits: () => void;
}

const BuyCreditsButton: React.FC<BuyCreditsButtonProps> = ({
  onBuyCredits,
}) => {
  return (
    <button
      onClick={onBuyCredits}
      className="flex items-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
      title="Buy more credits"
    >
      <PlusCircle size={14} className="mr-1" />
      <span>ADD CREDITS</span>
    </button>
  );
};

export default BuyCreditsButton;
