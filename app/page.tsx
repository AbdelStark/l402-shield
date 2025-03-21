// L402 Shield - Main App Page
"use client";
import { useState, useEffect } from "react";
import CreditCounter from "../components/CreditCounter";
import BlockInfo from "../components/BlockInfo";
import QRCodeModal from "../components/QRCodeModal";
import SignupPrompt from "../components/SignupPrompt";
import ArcadeButton from "../components/ArcadeButton";
import BuyCreditsButton from "../components/BuyCreditsButton";
import CreditPackageModal from "../components/CreditPackageModal";
import {
  signup,
  getInfo,
  getBlock,
  getPaymentRequest,
  getPaymentOptions,
  BlockData,
  PaymentRequiredError,
  OfferItem,
} from "../utils/api";

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
  const [creditPackageModalOpen, setCreditPackageModalOpen] = useState(false);
  const [availableOffers, setAvailableOffers] = useState<OfferItem[]>([]);
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

      console.log("Block response received:", response);

      // Check if payment is required (402)
      if ("payment_request_url" in response) {
        console.log("Payment required, processing payment flow");

        // Get the L402 payment details
        const paymentDetails = response as PaymentRequiredError;

        // Get the first offer (or let user select in a more advanced UI)
        if (!paymentDetails.offers || paymentDetails.offers.length === 0) {
          console.error("No offers found in payment details");
          alert("No payment options available. Please try again later.");
          return;
        }

        const selectedOffer = paymentDetails.offers[0];
        console.log("Selected offer:", selectedOffer);

        try {
          // Request the actual Lightning invoice
          const invoice = await getPaymentRequest(
            paymentDetails.payment_request_url,
            authToken,
            selectedOffer,
            "lightning",
            paymentDetails.payment_context_token,
          );

          console.log("Received Lightning invoice:", invoice);

          // Set the invoice and open QR modal
          setInvoice(invoice);
          setQRModalOpen(true);

          // Start polling for payment
          startPollingForPayment();
        } catch (error) {
          console.error("Failed to get payment request:", error);
          alert("Failed to generate payment invoice. Please try again.");
        }
      } else if ("error" in response) {
        // Another type of error in the response
        console.error("Error in block response:", response.error);
        alert(`Error: ${response.error}`);
      } else {
        // Success - we got block data
        console.log("Block data received:", response);
        setBlockData(response as BlockData);
        // Update credits (likely decreased by 1)
        fetchUserInfo(authToken);
      }
    } catch (error) {
      console.error("Failed to get block:", error);
      alert("Failed to get block data. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Start polling for payment confirmation
  const startPollingForPayment = () => {
    if (!authToken) {
      console.error("Cannot start polling: No auth token");
      return;
    }

    // Store initial credits to detect change
    const initialCredits = credits;
    console.log("Starting payment polling. Initial credits:", initialCredits);

    // Clear any existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
      console.log("Cleared previous polling interval");
    }

    // Start a new polling interval
    const interval = setInterval(async () => {
      try {
        const info = await getInfo(authToken);
        console.log("Polling for payment. Current credits:", info.credits);
        setCredits(info.credits);

        // If credits increased, payment was received
        if (info.credits > initialCredits) {
          console.log(
            "Payment detected! Credits increased from",
            initialCredits,
            "to",
            info.credits,
          );

          // Stop polling
          clearInterval(interval);
          setPollingInterval(null);

          // Close modal
          setQRModalOpen(false);

          // Auto-retry block fetch after brief delay
          setTimeout(() => {
            console.log("Auto-retrying block fetch after payment");
            handleGetBlock();
          }, 1000);
        }
      } catch (error) {
        console.error("Payment polling error:", error);
      }
    }, 2000); // Poll every 2 seconds (increased to reduce server load)

    setPollingInterval(interval);
    console.log("Payment polling started");
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // For testing purposes - simulate a 402 payment required
  const testPaymentFlow = () => {
    // This is a valid BOLT11 invoice format for testing only
    const testInvoice =
      "lnbc1500n1pj4ak5mpp5wlzpk5gzhm64arljy8f2vm8chnsc0l7xr4qsdqtsn99ytr283fqdqqcqzzsxqyz5vqsp5ve9mgtttjm7rdzmzq6nvgcj2h0wsdx2hgr4xr0c5lt3h8a6q9lhs9qyyssq7k4k3jgdnpxnpekjrxmx7keqxnrdfgjyn3pqjvavtnfq7lfdldnqmg5vd9xlvtpn3hvyn2k38tf9evd5q8hcfmhd4r78zhkzq077ucq7wkprg";
    console.log("Testing payment flow with sample invoice");
    setInvoice(testInvoice);
    setQRModalOpen(true);
    startPollingForPayment();
  };

  // Handle buying credits
  const handleBuyCredits = async () => {
    if (!authToken) return;

    try {
      setIsProcessing(true);
      const paymentDetails = await getPaymentOptions(authToken);

      // Check if we have offers
      if (!paymentDetails.offers || paymentDetails.offers.length === 0) {
        console.error("No offers available");
        alert("No payment options available. Please try again later.");
        return;
      }

      // Set available offers and open the package selection modal
      setAvailableOffers(paymentDetails.offers);
      setCreditPackageModalOpen(true);
    } catch (error) {
      console.error("Failed to get payment options:", error);
      alert("Failed to load payment options. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle selecting a credit package
  const handleSelectOffer = async (selectedOffer: OfferItem) => {
    if (!authToken) return;

    try {
      // Close the package selection modal
      setCreditPackageModalOpen(false);
      setIsProcessing(true);

      // Get the latest payment options to ensure we have current context token
      const paymentDetails = await getPaymentOptions(authToken);

      // Request the actual Lightning invoice
      const invoice = await getPaymentRequest(
        paymentDetails.payment_request_url,
        authToken,
        selectedOffer,
        "lightning",
        paymentDetails.payment_context_token,
      );

      console.log("Received Lightning invoice:", invoice);

      // Set the invoice and open QR modal
      setInvoice(invoice);
      setQRModalOpen(true);

      // Start polling for payment
      startPollingForPayment();
    } catch (error) {
      console.error("Failed to get payment request:", error);
      alert("Failed to generate payment invoice. Please try again.");
      setIsProcessing(false);
    }
  };

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
              <div className="flex items-center space-x-3">
                <CreditCounter credits={credits} />
                <BuyCreditsButton onBuyCredits={handleBuyCredits} />
              </div>

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

                  {/* Dev mode - hidden testing button */}
                  {process.env.NODE_ENV === "development" && (
                    <button
                      onClick={testPaymentFlow}
                      className="mt-2 px-3 py-1 text-xs text-gray-500 hover:text-gray-400 hover:underline"
                    >
                      Test Payment Flow
                    </button>
                  )}

                  {credits === 0 && (
                    <p className="text-yellow-500 mt-2 text-sm animate-pulse">
                      NO CREDITS REMAINING
                    </p>
                  )}
                </div>

                {/* Block Info Display */}
                {blockData && <BlockInfo blockData={blockData} />}
                {!blockData && isProcessing && (
                  <BlockInfo blockData={null} isLoading={true} />
                )}
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

      {/* Credit Package Selection Modal */}
      <CreditPackageModal
        isOpen={creditPackageModalOpen}
        onClose={() => setCreditPackageModalOpen(false)}
        offers={availableOffers}
        onSelectOffer={handleSelectOffer}
      />
    </main>
  );
}
