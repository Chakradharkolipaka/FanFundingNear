#!/bin/bash
set -e

echo "🔨 Building NEAR smart contract..."

# Navigate to the contract directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Build the contract
RUSTFLAGS='-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release

# Copy the wasm file to a convenient location
mkdir -p ../out
cp target/wasm32-unknown-unknown/release/nft_donation.wasm ../out/nft_donation.wasm

echo "✅ Contract built successfully!"
echo "📦 WASM file: out/nft_donation.wasm"
echo "📏 Size: $(wc -c < ../out/nft_donation.wasm) bytes"
