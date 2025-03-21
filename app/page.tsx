"use client";
import { useState, useEffect } from "react";
import CreditCounter from "../components/CreditCounter";
import BlockInfo from "../components/BlockInfo";
import QRCodeModal from "../components/QRCodeModal";
import SignupPrompt from "../components/SignupPrompt";
import ArcadeButton from "../components/ArcadeButton";
import { signup, getInfo, getBlock, BlockData } from "../utils/api";

export default function Home() {
  // Auth state
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // App state
  const [credits, setCredits] = useState(0);
  const [blockData, setBlockData] = useState<BlockData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment state
  const [qrModalOpen, setQRModalOpen] = useState(false);
  const [invoice, setInvoice] = useState("");
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Check for existing token on load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      fetchUserInfo(token);
    }
    setLoading(false);
  }, []);

  // Fetch user info (credits)
  const fetchUserInfo = async (token: string) => {
    try {
      const info = await getInfo(token);
      setCredits(info.credits);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      // If can't get info, token might be invalid - log out
      handleLogout();
    }
  };

  // Handle signup
  const handleSignup = async () => {
    try {
      setIsProcessing(true);
      const token = await signup();

      // Store token and update state
      localStorage.setItem("authToken", token);
      setAuthToken(token);

      // Get initial user info (credits)
      await fetchUserInfo(token);
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
    setCredits(0);
    setBlockData(null);

    // Stop any polling if active
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Handle get block request
  const handleGetBlock = async () => {
    if (!authToken) return;

    try {
      setIsProcessing(true);
      const response = await getBlock(authToken);

      // Check if payment is required (402)
      if ("invoice" in response) {
        // Set the invoice and open QR modal
        setInvoice(response.invoice);
        setQRModalOpen(true);

        // Start polling for payment
        startPollingForPayment();
      } else {
        // Success - we got block data
        setBlockData(response);
        // Update credits (likely decreased by 1)
        fetchUserInfo(authToken);
      }
    } catch (error) {
      console.error("Failed to get block:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start polling for payment confirmation
  const startPollingForPayment = () => {
    if (!authToken) return;

    // Store initial credits to detect change
    const initialCredits = credits;

    // Clear any existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Start a new polling interval
    const interval = setInterval(async () => {
      try {
        const info = await getInfo(authToken);
        setCredits(info.credits);

        // If credits increased, payment was received
        if (info.credits > initialCredits) {
          // Stop polling
          clearInterval(interval);
          setPollingInterval(null);

          // Close modal
          setQRModalOpen(false);

          // Auto-retry block fetch after brief delay
          setTimeout(() => {
            handleGetBlock();
          }, 1000);
        }
      } catch (error) {
        console.error("Payment polling error:", error);
      }
    }, 200); // Poll every 200 ms

    setPollingInterval(interval);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  if (loading) {
    return <div className="text-center py-20">LOADING...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Title Banner */}
      <h1 className="text-3xl font-bold text-center text-purple-500 neon-text my-8">
        L402 SHIELD
      </h1>

      {/* Content Area */}
      <div className="w-full max-w-2xl">
        {!authToken ? (
          // Signup Screen
          <SignupPrompt onSignup={handleSignup} />
        ) : (
          // Main Game Interface
          <div className="space-y-6">
            {/* Top Bar with Credits and Logout */}
            <div className="flex justify-between items-center">
              <CreditCounter credits={credits} />

              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white text-sm"
              >
                LOGOUT
              </button>
            </div>

            {/* Main Game Area */}
            <div className="bg-gray-900 p-6 rounded-lg border border-purple-700 shadow-lg">
              <div className="text-center space-y-8">
                <h2 className="text-cyan-400 text-xl">
                  BITCOIN BLOCK EXPLORER
                </h2>

                <div>
                  <ArcadeButton
                    onClick={handleGetBlock}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    GET LATEST BLOCK
                  </ArcadeButton>

                  {credits === 0 && (
                    <p className="text-yellow-500 mt-2 text-sm animate-pulse">
                      NO CREDITS REMAINING
                    </p>
                  )}
                </div>

                {/* Block Info Display */}
                {blockData && <BlockInfo blockData={blockData} />}
                {!blockData && isProcessing && <BlockInfo blockData={null} isLoading={true} />}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment QR Modal */}
      <QRCodeModal
        invoice={invoice}
        isOpen={qrModalOpen}
        onClose={() => {
          setQRModalOpen(false);
          // Stop polling when modal is closed
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }}
      />
    </main>
  );
}
