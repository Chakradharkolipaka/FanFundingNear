"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useNearWallet } from "@/hooks/useNearWallet";
import { hasViewTicket, type NFTData } from "@/lib/nftService";
import { formatNear, nearToYocto, getIpfsUrl } from "@/lib/utils";
import { GAS } from "@/constants";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Heart, Eye, Loader2, VideoIcon, User } from "lucide-react";
import Confetti from "react-confetti";

interface NFTCardProps {
  nft: NFTData;
  onDonationSuccess?: () => void;
}

export function NFTCard({ nft, onDonationSuccess }: NFTCardProps) {
  const { isConnected, accountId, callFunction, signIn } = useNearWallet();
  const { toast } = useToast();

  const [donateAmount, setDonateAmount] = useState("0.1");
  const [isDonating, setIsDonating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [hasTicket, setHasTicket] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [gatewayIndex, setGatewayIndex] = useState(0);
  const [donateDialogOpen, setDonateDialogOpen] = useState(false);

  const imageUrl = getIpfsUrl(nft.image_url, gatewayIndex);
  const isCreator = accountId === nft.creator;

  // Check if user has view ticket for video NFTs
  useEffect(() => {
    if (nft.is_video && accountId) {
      hasViewTicket(nft.id, accountId).then(setHasTicket).catch(console.error);
    }
  }, [nft.id, nft.is_video, accountId]);

  const handleImageError = useCallback(() => {
    if (gatewayIndex < 3) {
      setGatewayIndex((prev) => prev + 1);
      setImgError(false);
    } else {
      setImgError(true);
    }
  }, [gatewayIndex]);

  const handleDonate = async () => {
    if (!isConnected) {
      signIn();
      return;
    }

    const amount = parseFloat(donateAmount);
    if (!amount || amount < 0.01) {
      toast({
        title: "Invalid amount",
        description: "Minimum donation is 0.01 NEAR",
        variant: "destructive",
      });
      return;
    }

    if (amount > 1000) {
      toast({
        title: "Amount too large",
        description: "Maximum donation is 1000 NEAR",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDonating(true);
      const yoctoAmount = nearToYocto(donateAmount);

      await callFunction(
        "donate",
        { token_id: nft.id },
        GAS.DONATE,
        yoctoAmount
      );

      toast({
        title: "Donation sent! 💝",
        description: `You donated ${donateAmount} NEAR to ${nft.name}`,
      });

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setDonateDialogOpen(false);

      if (onDonationSuccess) {
        onDonationSuccess();
      }
    } catch (error) {
      console.error("Donate error:", error);
      toast({
        title: "Donation failed",
        description:
          error instanceof Error ? error.message : "Failed to donate",
        variant: "destructive",
      });
    } finally {
      setIsDonating(false);
    }
  };

  const handlePayToWatch = async () => {
    if (!isConnected) {
      signIn();
      return;
    }

    try {
      setIsPaying(true);
      const viewPriceStr =
        typeof nft.view_price === "string"
          ? nft.view_price
          : nft.view_price.toString();

      await callFunction(
        "pay_to_watch",
        { token_id: nft.id },
        GAS.PAY_TO_WATCH,
        viewPriceStr
      );

      toast({
        title: "Access granted! 🎬",
        description: `You can now watch "${nft.name}"`,
      });

      setHasTicket(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (error) {
      console.error("Pay to watch error:", error);
      toast({
        title: "Payment failed",
        description:
          error instanceof Error ? error.message : "Failed to pay for view",
        variant: "destructive",
      });
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
        {/* Image / Video */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {nft.is_video ? (
            <>
              {hasTicket || isCreator ? (
                <video
                  src={imageUrl}
                  className="w-full h-full object-cover"
                  controls
                  muted
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                  <VideoIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Pay to watch
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatNear(nft.view_price)} NEAR
                  </p>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                <VideoIcon className="h-3 w-3 inline mr-1" />
                Video
              </div>
            </>
          ) : imgError ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Image not available
              </p>
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={nft.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
              unoptimized
            />
          )}
        </div>

        {/* Content */}
        <CardContent className="pt-4 space-y-2">
          <h3 className="font-semibold truncate">{nft.name}</h3>
          {nft.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {nft.description}
            </p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{nft.creator}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-pink-500" />
              {formatNear(nft.total_donated)} NEAR
            </span>
            <span className="text-muted-foreground">
              {nft.donation_count} donation{nft.donation_count !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>

        {/* Actions */}
        <CardFooter className="flex gap-2">
          {/* Donate Button */}
          {!isCreator && (
            <Dialog open={donateDialogOpen} onOpenChange={setDonateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Heart className="mr-1 h-4 w-4" />
                  Donate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Donate to &quot;{nft.name}&quot;</DialogTitle>
                  <DialogDescription>
                    Send NEAR directly to the creator: {nft.creator}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Amount (NEAR)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.1"
                      value={donateAmount}
                      onChange={(e) => setDonateAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    {["0.1", "0.5", "1", "5"].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setDonateAmount(amount)}
                      >
                        {amount} Ⓝ
                      </Button>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleDonate} disabled={isDonating}>
                    {isDonating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Donating...
                      </>
                    ) : (
                      `Donate ${donateAmount} NEAR`
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Pay to Watch (video only) */}
          {nft.is_video && !hasTicket && !isCreator && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={handlePayToWatch}
              disabled={isPaying}
            >
              {isPaying ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Paying...
                </>
              ) : (
                <>
                  <Eye className="mr-1 h-4 w-4" />
                  Watch ({formatNear(nft.view_price)} Ⓝ)
                </>
              )}
            </Button>
          )}

          {/* Already has ticket */}
          {nft.is_video && hasTicket && !isCreator && (
            <Button variant="ghost" size="sm" className="flex-1" disabled>
              <Eye className="mr-1 h-4 w-4" />
              Access Granted ✓
            </Button>
          )}

          {/* Creator label */}
          {isCreator && (
            <Button variant="ghost" size="sm" className="flex-1" disabled>
              Your NFT
            </Button>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
