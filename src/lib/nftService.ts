import { viewFunction } from "@/lib/near";

/** NFT type matching contract struct */
export interface NFTData {
  id: number;
  creator: string;
  name: string;
  description: string;
  image_url: string;
  metadata_url: string;
  is_video: boolean;
  view_price: number | string;
  total_donated: number | string;
  donation_count: number;
  created_at: number;
}

/** ViewTicket type matching contract struct */
export interface ViewTicketData {
  token_id: number;
  viewer: string;
  paid_at: number;
}

/**
 * Fetch all NFTs from the contract
 */
export async function getAllNfts(): Promise<NFTData[]> {
  try {
    const nfts = await viewFunction<NFTData[]>("get_all_nfts");
    return nfts || [];
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return [];
  }
}

/**
 * Fetch a single NFT by token ID
 */
export async function getNft(tokenId: number): Promise<NFTData | null> {
  try {
    return await viewFunction<NFTData | null>("get_nft", { token_id: tokenId });
  } catch (error) {
    console.error("Error fetching NFT:", error);
    return null;
  }
}

/**
 * Check if a user has a view ticket for an NFT
 */
export async function hasViewTicket(tokenId: number, viewer: string): Promise<boolean> {
  try {
    return await viewFunction<boolean>("has_view_ticket", {
      token_id: tokenId,
      viewer,
    });
  } catch (error) {
    console.error("Error checking view ticket:", error);
    return false;
  }
}

/**
 * Get total NFTs count
 */
export async function getTotalNfts(): Promise<number> {
  try {
    return await viewFunction<number>("get_total_nfts");
  } catch (error) {
    console.error("Error fetching total NFTs:", error);
    return 0;
  }
}

/**
 * Get total donated amount (returns yoctoNEAR as string)
 */
export async function getTotalDonated(): Promise<string> {
  try {
    return await viewFunction<string>("get_total_donated");
  } catch (error) {
    console.error("Error fetching total donated:", error);
    return "0";
  }
}
