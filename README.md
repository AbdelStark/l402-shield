# L402 Shield

A web application that demonstrates the L402 protocol (Lightning HTTP 402) by integrating Lightning Network payments into a fun, nostalgic interface.

Try it out at [https://l402-shield.starknetonbitcoin.com](https://l402-shield.starknetonbitcoin.com).

## Overview

L402 Shield showcases how to implement the Lightning HTTP 402 Protocol (L402) for API monetization. The app interacts with a backend that provides three main endpoints:

- `/signup` - to obtain an auth token
- `/info` - to retrieve user credits
- `/block` - to get the latest Bitcoin block data (requires payment if out of credits)

The application follows a vintage arcade game theme with neon colors, pixelated fonts, and playful audio-visual feedback.

## Features

- **Retro Arcade UI**: Styled with neon colors, pixelated fonts, and arcade-style animations
- **Token-based Authentication**: Sign up to receive an auth token
- **Credit System**: Track your credits in a coin-based counter
- **Lightning Payments**: Multiple options for paying with Lightning
  - **QR Code**: Scan a QR code with a Lightning wallet to pay
  - **Bitcoin Connect**: Connect directly to your browser's Lightning wallet
- **Block Explorer**: View the latest Bitcoin block information

## Getting Started

### Prerequisites

- Node.js 16+ or latest LTS
- A Lightning wallet for testing payments
- A compatible L402 backend server

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AbdelStark/l402-shield.git
   cd l402-shield
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the backend URL:
   Create a `.env.local` file in the root directory:

   ```text
   NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8080"
   ```

   Replace the URL with your backend server address.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up**: Click the "PRESS START" button to get an auth token
2. **View Credits**: Check your available credits in the top-left corner
3. **Get Block Data**: Click the "GET LATEST BLOCK" button
   - If you have credits, you'll see the latest block information
   - If you're out of credits, payment options will appear
4. **Choose Payment Method**: Toggle between QR code and wallet connection
   - **QR Code**: Scan with any Lightning wallet
   - **Wallet Connection**: Connect directly to your browser's Lightning wallet with Bitcoin Connect
5. **Add Credits**: Complete payment to add credits
6. **Logout**: Click "LOGOUT" to clear your session

## Development

- Built with Next.js and TypeScript
- Styled with Tailwind CSS
- Uses react-qr-code for QR code generation
- Integrates with Bitcoin Connect for direct wallet connections

## License

[MIT](LICENSE)

---

Built with 🧡 by [@AbdelStark](https://github.com/AbdelStark)

Feel free to follow me on Nostr if you'd like, using my public key:

```text
npub1hr6v96g0phtxwys4x0tm3khawuuykz6s28uzwtj5j0zc7lunu99snw2e29
```

Or just **scan this QR code** to find me:

![Nostr Public Key QR Code](https://hackmd.io/_uploads/SkAvwlYYC.png)
