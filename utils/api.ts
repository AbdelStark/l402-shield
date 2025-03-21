// API base URL from environment variable or default to localhost
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080";

// Types
export interface SignupResponse {
  id: string;
  credits: number;
  created_at: string;
  last_credit_update_at: string;
}

export interface UserInfo {
  credits: number;
}

export interface BlockData {
  height: number;
  hash: string;
  timestamp: string;
}

export interface PaymentRequiredError {
  expiry: string;
  offers: OfferItem[];
  payment_context_token: string;
  payment_request_url: string;
}

export interface OfferItem {
  id: string;
  amount: string;
  description: string;
  currency: string;
}

// API functions
export async function signup(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/signup`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Signup failed: ${response.statusText}`);
    }

    const data = (await response.json()) as SignupResponse;
    return data.id;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}

export async function getInfo(token: string): Promise<UserInfo> {
  try {
    const response = await fetch(`${API_BASE}/info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Info fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data as UserInfo;
  } catch (error) {
    console.error("Info fetch error:", error);
    throw error;
  }
}

export async function getBlock(
  token: string,
): Promise<BlockData | PaymentRequiredError> {
  try {
    const response = await fetch(`${API_BASE}/block`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    // If status is 402, return the payment info
    if (response.status === 402) {
      console.log("Received 402 Payment Required response:", data);
      return data as PaymentRequiredError;
    }

    // If successful, return the block data
    if (response.ok) {
      return data as BlockData;
    }

    throw new Error(`Block fetch failed: ${response.statusText}`);
  } catch (error) {
    console.error("Block fetch error:", error);
    throw error;
  }
}

export async function getPaymentRequest(
  paymentRequestUrl: string,
  token: string,
  offer: OfferItem,
  paymentMethod: string,
  paymentContextToken: string,
): Promise<string> {
  try {
    console.log("Fetching payment request from:", paymentRequestUrl);
    console.log("Selected offer:", offer);

    const response = await fetch(paymentRequestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        offer_id: offer.id,
        payment_method: paymentMethod,
        payment_context_token: paymentContextToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Payment request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Payment request response:", data);

    // The response should contain the Lightning invoice
    if (data && data.payment_request) {
      return data.payment_request;
    } else {
      throw new Error("No payment_request in response");
    }
  } catch (error) {
    console.error("Payment request error:", error);
    throw error;
  }
}
