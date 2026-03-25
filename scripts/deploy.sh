#!/bin/bash
set -e

# NEAR Contract Deployment Script
# Usage: ./scripts/deploy.sh <account-id>
# Example: ./scripts/deploy.sh nft-donation.testnet

ACCOUNT_ID=${1:-"cleannook9921.testnet"}
WASM_FILE="./contracts/out/nft_donation.wasm"

echo "🚀 Deploying NFT Donation contract to NEAR Testnet..."
echo "📋 Account: $ACCOUNT_ID"

# Check if WASM file exists
if [ ! -f "$WASM_FILE" ]; then
    echo "❌ WASM file not found at $WASM_FILE"
    echo "   Run 'cd contracts && bash build.sh' first"
    exit 1
fi

# Deploy the contract
echo "📤 Deploying contract..."
near deploy "$ACCOUNT_ID" "$WASM_FILE"

# Initialize the contract
echo "🔧 Initializing contract..."
near call "$ACCOUNT_ID" new '{}' --accountId "$ACCOUNT_ID"

echo ""
echo "✅ Contract deployed and initialized successfully!"
echo "📋 Contract ID: $ACCOUNT_ID"
echo "🔗 Explorer: https://testnet.nearblocks.io/address/$ACCOUNT_ID"
echo ""
echo "📝 Update your .env.local:"
echo "   NEXT_PUBLIC_CONTRACT_ID=$ACCOUNT_ID"
