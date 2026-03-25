# FanFunding NEAR — NFT Donation Platform

A decentralized NFT creation and fan donation platform built on **NEAR Protocol**. Creators can mint image/video NFTs, fans can donate NEAR directly to creators, and video content is monetized via pay-per-view.

![NEAR Protocol](https://img.shields.io/badge/NEAR-Protocol-00C08B?style=for-the-badge&logo=near&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-Smart_Contract-DEA584?style=for-the-badge&logo=rust&logoColor=white)

## ✨ Features

- **🖼️ Mint Image NFTs** — Upload images to IPFS (Pinata) and mint as NFTs on NEAR
- **🎬 Mint Video NFTs** — Upload videos with pay-per-view pricing
- **💝 Fan Donations** — Donate NEAR directly to NFT creators (sent instantly via smart contract)
- **👁️ Pay-Per-View** — Pay to unlock video NFT content
- **🔗 NEAR Wallet Selector** — Connect via **Meteor Wallet** (recommended), MyNearWallet, or HERE Wallet
- **🌙 Dark/Light Theme** — Full theme support with shadcn/ui
- **📱 Responsive Design** — Mobile-first with bottom navigation

## 🏗️ Architecture

```
FanFundingNear/
├── contracts/                  # Rust smart contracts
│   ├── Cargo.toml              # Workspace manifest
│   ├── build.sh                # Build script
│   └── nft_donation/           # Main contract crate
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs          # Contract struct, init, views
│           ├── types.rs        # NFT, ViewTicket structs
│           ├── mint.rs         # mint_nft, mint_video_nft
│           ├── donate.rs       # donate (transfers NEAR to creator)
│           └── pay_per_view.rs # pay_to_watch, has_view_ticket
├── src/                        # Next.js 14 frontend
│   ├── app/
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Dashboard — NFT grid, stats
│   │   ├── mint/page.tsx       # Mint page — upload & mint
│   │   ├── providers.tsx       # NearWallet + Query + Theme
│   │   ├── globals.css         # Tailwind + shadcn CSS vars
│   │   ├── theme-provider.tsx  # next-themes wrapper
│   │   └── api/pinata/upload/  # Pinata IPFS upload API route
│   ├── components/
│   │   ├── NFTCard.tsx         # NFT card with donate/pay-to-watch
│   │   ├── Navbar.tsx          # Desktop navigation
│   │   ├── BottomNav.tsx       # Mobile bottom navigation
│   │   ├── ConnectWallet.tsx   # NEAR wallet connect button
│   │   ├── PageTransitionWrapper.tsx
│   │   ├── SkeletonCard.tsx
│   │   ├── theme-toggle.tsx
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/
│   │   └── useNearWallet.tsx   # NEAR wallet context & hook
│   ├── lib/
│   │   ├── near.ts             # NEAR RPC provider & view calls
│   │   ├── wallet.ts           # Wallet Selector initialization
│   │   ├── nftService.ts       # NFT data fetching functions
│   │   ├── ipfs.ts             # Pinata upload helper
│   │   └── utils.ts            # Formatting, IPFS gateways
│   └── constants/
│       └── index.ts            # Contract ID, network config, gas
├── scripts/
│   └── deploy.sh               # Contract deployment script
├── package.json
├── tailwind.config.ts
└── README.md
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | NEAR Protocol (Testnet) |
| **Smart Contract** | Rust + near-sdk-rs v5 |
| **Frontend** | Next.js 14 (App Router) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Wallet** | NEAR Wallet Selector (**Meteor Wallet** primary + MyNEAR + HERE) |
| **SDK** | near-api-js v4 |
| **IPFS** | Pinata Cloud |
| **Animations** | Framer Motion |

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **Rust** + `wasm32-unknown-unknown` target (for contract building)
- **near-cli** (for contract deployment)
- **Pinata** account for IPFS uploads

### 1. Install Dependencies

```bash
cd FanFundingNear
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_NEAR_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ID=your-contract.testnet
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud
```

### 3. Build Smart Contract (optional)

```bash
# Install Rust WASM target
rustup target add wasm32-unknown-unknown

# Build the contract
cd contracts
bash build.sh
```

### 4. Deploy Smart Contract (optional)

```bash
# Create a NEAR testnet account at https://testnet.mynearwallet.com
# Then deploy:
bash scripts/deploy.sh your-contract.testnet
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Smart Contract API

### Write Methods (require wallet signature + gas)

| Method | Deposit | Description |
|--------|---------|-------------|
| `mint_nft(name, description, image_url, metadata_url)` | 0.1 NEAR | Mint an image NFT |
| `mint_video_nft(name, description, image_url, metadata_url, view_price)` | 0.1 NEAR | Mint a video NFT |
| `donate(token_id)` | Any amount | Donate NEAR to NFT creator |
| `pay_to_watch(token_id)` | >= view_price | Purchase view ticket for video |

### View Methods (free, no wallet needed)

| Method | Returns | Description |
|--------|---------|-------------|
| `get_all_nfts()` | `Vec<NFT>` | All minted NFTs |
| `get_nft(token_id)` | `Option<NFT>` | Single NFT by ID |
| `get_total_nfts()` | `u64` | Total NFT count |
| `get_total_donated()` | `String` | Total donated (yoctoNEAR) |
| `has_view_ticket(token_id, viewer)` | `bool` | Check view access |

## 🔗 NEAR Resources

- **Meteor Wallet** (recommended): https://meteorwallet.app — [Chrome Extension](https://chromewebstore.google.com/detail/meteor-wallet/pcndjhkinnkaohffealmlmhaepkpmgkb)
- **Testnet Faucet**: https://near-faucet.io
- **Testnet Wallet**: https://testnet.mynearwallet.com
- **Block Explorer**: https://testnet.nearblocks.io
- **NEAR Docs**: https://docs.near.org

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.
