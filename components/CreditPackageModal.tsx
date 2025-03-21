"use client";
import { useEffect, useState } from "react";
import { OfferItem } from "../utils/api";

interface CreditPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  offers: OfferItem[];
  onSelectOffer: (offer: OfferItem) => void;
}

const CreditPackageModal: React.FC<CreditPackageModalProps> = ({
  isOpen,
  onClose,
  offers,
  onSelectOffer,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // Add a short delay before fully hiding to allow for animation
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isOpen ? "opacity-100" : "opacity-0"
      } transition-opacity duration-300`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 bg-black p-6 max-w-md w-full rounded-lg border-2 border-cyan-500 shadow-[0_0_15px_#06B6D4] scanlines">
        <div className="text-center">
          <h2 className="text-cyan-400 neon-text text-xl mb-4">
            SELECT CREDIT PACKAGE
          </h2>

          <div className="grid grid-cols-1 gap-4 mb-6">
            {offers.map((offer) => (
              <button
                key={offer.id}
                onClick={() => onSelectOffer(offer)}
                className="bg-gray-900 p-4 rounded-md border border-cyan-700 hover:border-cyan-500 transition-colors"
              >
                <div className="text-white text-lg font-bold mb-1">
                  {offer.description}
                </div>
                <div className="text-cyan-300 text-sm">
                  {offer.amount} {offer.currency}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditPackageModal;
