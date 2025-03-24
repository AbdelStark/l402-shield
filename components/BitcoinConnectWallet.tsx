"use client";
import { useEffect, useState } from "react";
import {
    PayButton,
    init,
    closeModal, onConnected
} from "@getalby/bitcoin-connect-react";

// Add WebLN type extension for Window
declare global {
  interface Window {
    webln: any;
  }
}

interface BitcoinConnectWalletProps {
  invoice: string;
  isOpen: boolean;
  onClose: () => void;
  onPaid: (preimage: string) => void;
}

export default function BitcoinConnectWallet({
  invoice,
  isOpen,
  onClose,
  onPaid,
}: BitcoinConnectWalletProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [paymentPreimage, setPaymentPreimage] = useState<string | null>(null);
  const [isBrowser, setIsBrowser] = useState(false);

  // Check if we're in browser environment
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Initialize Bitcoin Connect once in browser only
  useEffect(() => {
    if (isBrowser && !isInitialized) {
      try {
        init({
          appName: "L402 Shield",
        });
        
        // Set WebLN on window object for compatibility
        const unsubscribe = onConnected((provider) => {
          window.webln = provider;
        });
        
        setIsInitialized(true);
        
        // Cleanup subscription on unmount
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error("Failed to initialize Bitcoin Connect:", error);
      }
    }
  }, [isInitialized, isBrowser]);

  // Handle modal visibility - browser only
  useEffect(() => {
    if (isBrowser && !isOpen && isInitialized) {
      closeModal();
    }
  }, [isOpen, isInitialized, isBrowser]);

  // Reset payment status when invoice changes
  useEffect(() => {
    setPaymentPreimage(null);
  }, [invoice]);

  // Handle successful payment
  const handlePaymentSuccess = (response: { preimage: string }) => {
    const preimage = response.preimage;
    setPaymentPreimage(preimage);
    onPaid(preimage);
    onClose();
  };

  // Don't render anything on server or if modal should be closed
  if (!isBrowser || !isOpen || !invoice) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-gray-900 p-6 rounded-lg border border-purple-700 shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-cyan-400">Pay with Lightning</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <PayButton 
              invoice={invoice} 
              onPaid={handlePaymentSuccess} 
              payment={paymentPreimage ? { preimage: paymentPreimage } : undefined}
            />
          </div>
          
          <p className="text-sm text-gray-400 text-center mt-4">
            This will connect to your Lightning wallet to pay the invoice.
          </p>
        </div>
      </div>
    </div>
  );
} 