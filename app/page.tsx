// L402 Shield - Main App Page
"use client";
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import CreditCounter from "../components/CreditCounter";
import BlockInfo from "../components/BlockInfo";
import QRCodeModal from "../components/QRCodeModal";
import SignupPrompt from "../components/SignupPrompt";
import ArcadeButton from "../components/ArcadeButton";
import BuyCreditsButton from "../components/BuyCreditsButton";
import CreditPackageModal from "../components/CreditPackageModal";
import { trackWebVitals, trackEvent } from "../utils/analytics";
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

// Dynamically import BitcoinConnectWallet to avoid server-side rendering issues
const BitcoinConnectWallet = dynamic(
  () => import("../components/BitcoinConnectWallet"),
  { ssr: false }
);

// Add this new component for structured data
function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "L402 Shield",
    "description": "A retro arcade-style demo of the L402 Lightning HTTP 402 Protocol for Bitcoin micropayments",
    "url": "https://l402.starknetonbitcoin.com/",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Any",
    "author": {
      "@type": "Person",
      "name": "AbdelStark",
      "url": "https://github.com/AbdelStark"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "inLanguage": "en",
    "keywords": "Bitcoin, Lightning Network, L402, HTTP 402, micropayments",
    "datePublished": "2023-10-01"
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function Home() {
  // Auth state
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // App state
  const [credits, setCredits] = useState(0);
  const [blockData, setBlockData] = useState<BlockData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBlockLoading, setIsBlockLoading] = useState(false);

  // Payment state
  const [qrModalOpen, setQRModalOpen] = useState(false);
  const [bitcoinConnectOpen, setBitcoinConnectOpen] = useState(false);
  const [creditPackageModalOpen, setCreditPackageModalOpen] = useState(false);
  const [availableOffers, setAvailableOffers] = useState<OfferItem[]>([]);
  const [invoice, setInvoice] = useState("");
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [paymentContext, setPaymentContext] = useState<
    "block" | "credits" | null
  >(null);
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "wallet">("qr");

  const pathname = usePathname();

  // Initialize web vitals tracking
  useEffect(() => {
    // Track web vitals on component mount
    if (typeof window !== 'undefined') {
      trackWebVitals(pathname || '');
    }
  }, [pathname]);

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

  // Handle signup with analytics
  const handleSignup = async () => {
    try {
      setIsProcessing(true);
      trackEvent('signup_started');
      const token = await signup();

      // Store token and update state
      localStorage.setItem("authToken", token);
      setAuthToken(token);

      // Get initial user info (credits)
      await fetchUserInfo(token);
      trackEvent('signup_completed');
    } catch (error) {
      console.error("Signup failed:", error);
      trackEvent('signup_failed', { error: String(error) });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle logout with analytics
  const handleLogout = () => {
    trackEvent('user_logout');
    localStorage.removeItem("authToken");
    setAuthToken(null);
    setCredits(0);
    setBlockData(null);
    setPaymentContext(null);
    setIsBlockLoading(false);

    // Stop any polling if active
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Handle get block request with analytics
  const handleGetBlock = async () => {
    if (!authToken) return;

    try {
      setIsProcessing(true);
      setIsBlockLoading(true);
      trackEvent('block_request_started');
      const response = await getBlock(authToken);

      console.log("Block response received:", response);

      // Check if payment is required (402)
      if ("payment_request_url" in response) {
        console.log("Payment required, processing payment flow");
        trackEvent('payment_required', { context: 'block' });

        // Set payment context to "block" to indicate this payment is for a block fetch
        setPaymentContext("block");

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

          // Set the invoice and open payment modal based on preferred method
          setInvoice(invoice);
          
          if (paymentMethod === "qr") {
            setQRModalOpen(true);
          } else {
            setBitcoinConnectOpen(true);
          }

          // Start polling for payment
          startPollingForPayment();
        } catch (error) {
          console.error("Failed to get payment request:", error);
          alert("Failed to generate payment invoice. Please try again.");
          setIsBlockLoading(false);
        }
      } else if ("error" in response) {
        // Another type of error in the response
        console.error("Error in block response:", response.error);
        alert(`Error: ${response.error}`);
        trackEvent('block_request_error', { error: response.error });
        setIsBlockLoading(false);
      } else {
        // Success - we got block data
        console.log("Block data received:", response);
        setBlockData(response as BlockData);
        setIsBlockLoading(false);
        // Update credits (likely decreased by 1)
        fetchUserInfo(authToken);
        trackEvent('block_request_success', { 
          height: (response as BlockData).height
        });
      }
    } catch (error) {
      console.error("Failed to get block:", error);
      alert("Failed to get block data. Please try again.");
      trackEvent('block_request_error', { error: String(error) });
      setIsBlockLoading(false);
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
          setIsProcessing(false);

          // Close modals
          setQRModalOpen(false);
          setBitcoinConnectOpen(false);

          // Only retry block fetch if the payment was initiated from a block request
          if (paymentContext === "block") {
            setTimeout(() => {
              console.log("Auto-retrying block fetch after payment");
              handleGetBlock();
            }, 1000);
          } else {
            console.log("Credits purchased directly, not fetching block");
            // Make sure we're not showing block loading state when just buying credits
            setIsBlockLoading(false);
          }

          // Reset payment context
          setPaymentContext(null);
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

  // Handle buying credits with analytics
  const handleBuyCredits = async () => {
    if (!authToken) return;

    try {
      setIsProcessing(true);
      trackEvent('buy_credits_started');

      // Set payment context to "credits" to indicate this is a direct credits purchase
      setPaymentContext("credits");

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
      trackEvent('buy_credits_error', { error: String(error) });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle selecting a credit package with analytics
  const handleSelectOffer = async (selectedOffer: OfferItem) => {
    if (!authToken) return;

    try {
      // Close the package selection modal
      setCreditPackageModalOpen(false);
      setIsProcessing(true);
      trackEvent('credit_package_selected', { 
        package_id: selectedOffer.id,
        amount: selectedOffer.amount,
        currency: selectedOffer.currency
      });

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

      // Set the invoice and open payment modal based on preferred method
      setInvoice(invoice);
          
      if (paymentMethod === "qr") {
        setQRModalOpen(true);
      } else {
        setBitcoinConnectOpen(true);
      }

      // Start polling for payment
      startPollingForPayment();
    } catch (error) {
      console.error("Failed to get payment request:", error);
      alert("Failed to generate payment invoice. Please try again.");
      trackEvent('payment_request_error', { error: String(error) });
      setIsProcessing(false);
    }
  };

  // Handle successful payment via Bitcoin Connect with analytics
  const handleBitcoinConnectPayment = (preimage: string) => {
    console.log("Payment completed via Bitcoin Connect:", preimage);
    trackEvent('payment_success', { method: 'bitcoin_connect' });
    
    // Force refresh user info to get updated credits
    if (authToken) {
      fetchUserInfo(authToken);
    }
    
    // Continue with standard flow
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    setBitcoinConnectOpen(false);
    setIsProcessing(false);
    
    // Only retry block fetch if the payment was initiated from a block request
    if (paymentContext === "block") {
      setTimeout(() => {
        console.log("Auto-retrying block fetch after payment");
        handleGetBlock();
      }, 1000);
    } else {
      console.log("Credits purchased directly, not fetching block");
      setIsBlockLoading(false);
    }
    
    setPaymentContext(null);
  };

  // Toggle payment method with analytics
  const togglePaymentMethod = () => {
    const newMethod = paymentMethod === "qr" ? "wallet" : "qr";
    trackEvent('payment_method_changed', { method: newMethod });
    setPaymentMethod(newMethod);
  };

  if (loading) {
    return <div className="text-center py-20">LOADING...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <StructuredData />
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

              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePaymentMethod}
                  className="text-sm bg-gray-800 px-2 py-1 rounded hover:bg-gray-700"
                >
                  {paymentMethod === "qr" ? "🔄 Use Wallet" : "🔄 Use QR Code"}
                </button>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  LOGOUT
                </button>
              </div>
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
                {!blockData && isBlockLoading && (
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
          // Reset payment context if user cancels
          setPaymentContext(null);
          // Ensure we're not showing block loading if user cancels
          setIsBlockLoading(false);
          setIsProcessing(false);
        }}
      />

      {/* Bitcoin Connect Wallet Modal */}
      <Suspense fallback={null}>
        <BitcoinConnectWallet
          invoice={invoice}
          isOpen={bitcoinConnectOpen}
          onClose={() => {
            setBitcoinConnectOpen(false);
            // Stop polling when modal is closed
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
            // Reset payment context if user cancels
            setPaymentContext(null);
            // Ensure we're not showing block loading if user cancels
            setIsBlockLoading(false);
            setIsProcessing(false);
          }}
          onPaid={handleBitcoinConnectPayment}
        />
      </Suspense>

      {/* Credit Package Selection Modal */}
      <CreditPackageModal
        isOpen={creditPackageModalOpen}
        onClose={() => {
          setCreditPackageModalOpen(false);
          // Reset payment context if user cancels
          setPaymentContext(null);
          setIsProcessing(false);
          setIsBlockLoading(false);
        }}
        offers={availableOffers}
        onSelectOffer={handleSelectOffer}
      />

      {/* Footer with SEO-friendly links */}
      <footer className="mt-16 py-8 border-t border-gray-800 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold text-purple-400 mb-4">About L402 Shield</h2>
          <p className="text-gray-300 mb-6">
            L402 Shield demonstrates the Lightning HTTP 402 Protocol (L402) for API monetization, allowing seamless Bitcoin micropayments through the Lightning Network.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <h3 className="text-white font-medium mb-2">Key Features</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>Lightning Network Payments</li>
                <li>Bitcoin Connect Wallet Integration</li>
                <li>Credit System for API Access</li>
                <li>HTTP 402 Payment Required Implementation</li>
                <li>Retro Arcade Interface</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Learn More</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li><a href="https://github.com/AbdelStark/l402-shield" className="text-purple-400 hover:text-purple-300">GitHub Repository</a></li>
                <li><a href="https://lightning.network/" className="text-purple-400 hover:text-purple-300">Lightning Network</a></li>
                <li><a href="https://bitcoin.org/" className="text-purple-400 hover:text-purple-300">Bitcoin</a></li>
                <li><a href="https://www.l402.org/" className="text-purple-400 hover:text-purple-300">L402 Protocol</a></li>
              </ul>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} L402 Shield | Created by <a href="https://github.com/AbdelStark" className="text-purple-400 hover:text-purple-300">AbdelStark</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
