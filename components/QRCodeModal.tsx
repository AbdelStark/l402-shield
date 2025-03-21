"use client";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

interface QRCodeModalProps {
  invoice: string;
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  invoice,
  isOpen,
  onClose,
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
      <div className="relative z-10 bg-black p-6 max-w-md w-full rounded-lg border-2 border-pink-500 shadow-[0_0_15px_#EC4899] scanlines">
        <div className="text-center">
          <h2 className="text-pink-500 neon-text text-xl mb-2">
            PAYMENT REQUIRED
          </h2>
          <p className="text-white mb-4">NO CREDITS! INSERT COIN TO CONTINUE</p>

          {/* QR Code with neon border */}
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white rounded-md">
              <QRCode value={invoice} size={200} />
            </div>
          </div>

          <p className="text-sm text-gray-300 mb-4">
            Scan this QR code with a Lightning wallet to add credits
          </p>

          {/* Copy to clipboard option */}
          <div className="bg-gray-900 p-2 rounded text-xs text-gray-400 overflow-x-auto mb-4">
            <code>{invoice}</code>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-pink-700 hover:bg-pink-800 text-white text-sm rounded"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
