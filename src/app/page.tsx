"use client";

import { useEffect, useState, useCallback } from "react";
import { useNearWallet } from "@/hooks/useNearWallet";
import { getAllNfts, getTotalDonated, type NFTData } from "@/lib/nftService";
import { NFTCard } from "@/components/NFTCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Card, CardContent } from "@/components/ui/card";
import { formatNear } from "@/lib/utils";
import { getConfig } from "@/constants";
import { METEOR_EXTENSION_URL } from "@/lib/wallet";

export default function Home() {
  const { isConnected, accountId, isLoading: walletLoading } = useNearWallet();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [totalDonated, setTotalDonated] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const config = getConfig();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [nftData, donatedData] = await Promise.all([
        getAllNfts(),
        getTotalDonated(),
      ]);
      setNfts(nftData);
      setTotalDonated(donatedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch NFTs. Make sure the contract is deployed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!walletLoading) {
      fetchData();

      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchData, 30_000);
      return () => clearInterval(interval);
    }
  }, [walletLoading, fetchData]);

  const statsCards = [
    {
      label: "Total NFTs",
      value: nfts.length.toString(),
      icon: "🖼️",
    },
    {
      label: "Total Donated",
      value: `${formatNear(totalDonated)} NEAR`,
      icon: "💝",
    },
    {
      label: "Network",
      value: config.networkId === "testnet" ? "NEAR Testnet" : "NEAR Mainnet",
      icon: "🌐",
    },
    {
      label: "Token",
      value: "NEAR",
      icon: "💎",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          FanFunding{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
            NEAR
          </span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create NFTs, receive donations from fans, and monetize video content —
          all powered by NEAR Protocol.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-semibold truncate">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Connection Status */}
      {!isConnected && !walletLoading && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              🔗 Connect your NEAR wallet to donate, mint NFTs, and pay for
              video content.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Recommended:{" "}
              <a
                href={METEOR_EXTENSION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-orange-500 hover:text-orange-600 font-medium"
              >
                Meteor Wallet
              </a>{" "}
              (Chrome extension) — also supports MyNearWallet &amp; HERE Wallet
            </p>
          </CardContent>
        </Card>
      )}

      {isConnected && (
        <div className="text-sm text-muted-foreground text-center">
          Connected as{" "}
          <span className="font-mono font-medium text-foreground">
            {accountId}
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            <p>{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      )}

      {/* NFT Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          {loading ? "Loading NFTs..." : `NFTs (${nfts.length})`}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : nfts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground text-lg">
                No NFTs minted yet 🎨
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to create an NFT!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                onDonationSuccess={fetchData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-muted-foreground space-y-1 pt-4">
        <p>
          Explorer:{" "}
          <a
            href={config.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            {config.explorerUrl}
          </a>
        </p>
        {config.faucetUrl && (
          <p>
            Faucet:{" "}
            <a
              href={config.faucetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              {config.faucetUrl}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
