"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useNearWallet } from "@/hooks/useNearWallet";
import { uploadToPinata } from "@/lib/ipfs";
import { nearToYocto } from "@/lib/utils";
import { GAS, DEPOSITS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Upload, ImageIcon, VideoIcon, Loader2 } from "lucide-react";

export default function MintPage() {
  const { isConnected, callFunction, signIn } = useNearWallet();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [viewPrice, setViewPrice] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = useCallback(
    (selectedFile: File) => {
      const MAX_SIZE_MB = 50;
      const fileType = selectedFile.type;
      const isVideoFile = fileType.startsWith("video/");
      const isImageFile = fileType.startsWith("image/");

      if (!isVideoFile && !isImageFile) {
        toast({
          title: "Invalid file type",
          description: "Please select an image or video file",
          variant: "destructive",
        });
        return;
      }

      if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Maximum file size is ${MAX_SIZE_MB}MB`,
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      setIsVideo(isVideoFile);
      setPreview(URL.createObjectURL(selectedFile));
    },
    [toast]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;
      validateAndSetFile(selectedFile);
    },
    [validateAndSetFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files?.[0];
      if (!droppedFile) return;
      validateAndSetFile(droppedFile);
    },
    [validateAndSetFile]
  );

  const handleMint = async () => {
    if (!isConnected) {
      signIn();
      return;
    }

    if (!file || !name.trim()) {
      toast({
        title: "Missing fields",
        description: "Please provide a name and file",
        variant: "destructive",
      });
      return;
    }

    if (isVideo && (!viewPrice || parseFloat(viewPrice) <= 0)) {
      toast({
        title: "Invalid view price",
        description: "Video NFTs require a view price greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsMinting(true);
      setUploadProgress("Uploading to IPFS...");

      // Upload file + metadata to Pinata
      const { imageUrl, metadataUrl } = await uploadToPinata(
        file,
        name,
        description
      );

      setUploadProgress("Minting NFT on NEAR...");

      if (isVideo) {
        // Mint video NFT
        const viewPriceYocto = nearToYocto(viewPrice);
        await callFunction(
          "mint_video_nft",
          {
            name: name.trim(),
            description: description.trim(),
            image_url: imageUrl,
            metadata_url: metadataUrl,
            view_price: viewPriceYocto,
          },
          GAS.MINT,
          DEPOSITS.MINT
        );
      } else {
        // Mint image NFT
        await callFunction(
          "mint_nft",
          {
            name: name.trim(),
            description: description.trim(),
            image_url: imageUrl,
            metadata_url: metadataUrl,
          },
          GAS.MINT,
          DEPOSITS.MINT
        );
      }

      toast({
        title: "NFT Minted! 🎉",
        description: `Your ${isVideo ? "video" : "image"} NFT "${name}" has been minted on NEAR!`,
      });

      // Reset form
      setName("");
      setDescription("");
      setFile(null);
      setPreview(null);
      setIsVideo(false);
      setViewPrice("");
      setUploadProgress("");

      // Navigate to home after short delay
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      console.error("Mint error:", error);
      toast({
        title: "Mint failed",
        description:
          error instanceof Error ? error.message : "Failed to mint NFT",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Mint NFT</h1>
        <p className="text-muted-foreground">
          Create an image or video NFT on NEAR Protocol
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>NFT Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <Input
              placeholder="My Amazing NFT"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isMinting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe your NFT..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isMinting}
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">File *</label>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="space-y-4">
                  {isVideo ? (
                    <video
                      src={preview}
                      className="max-h-48 mx-auto rounded-lg"
                      controls
                      muted
                    />
                  ) : (
                    <Image
                      src={preview}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="mx-auto rounded-lg object-cover"
                    />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {file?.name} ({isVideo ? "Video" : "Image"})
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                      setIsVideo(false);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports images and videos
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" /> Images
                    </span>
                    <span className="flex items-center gap-1">
                      <VideoIcon className="h-4 w-4" /> Videos
                    </span>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* View Price (only for videos) */}
          {isVideo && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                View Price (NEAR) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.1"
                value={viewPrice}
                onChange={(e) => setViewPrice(e.target.value)}
                disabled={isMinting}
              />
              <p className="text-xs text-muted-foreground">
                Fans must pay this amount to watch the video
              </p>
            </div>
          )}

          {/* Mint Info */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
            <p>
              <strong>Mint deposit:</strong> 0.1 NEAR (storage cost)
            </p>
            <p>
              <strong>Network:</strong> NEAR Testnet
            </p>
            {isVideo && viewPrice && (
              <p>
                <strong>View price:</strong> {viewPrice} NEAR
              </p>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {uploadProgress}
            </div>
          )}

          {/* Mint Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleMint}
            disabled={isMinting || !file || !name.trim()}
          >
            {isMinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : !isConnected ? (
              "Connect Meteor Wallet to Mint"
            ) : (
              `Mint ${isVideo ? "Video" : "Image"} NFT (0.1 NEAR)`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
