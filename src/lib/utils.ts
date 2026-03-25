import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format yoctoNEAR (10^24) to human-readable NEAR amount
 */
export function formatNear(yoctoNear: string | number | bigint): string {
  const yocto = BigInt(yoctoNear);
  const near = Number(yocto) / 1e24;
  if (near === 0) return "0";
  if (near < 0.001) return "< 0.001";
  return near.toFixed(4).replace(/\.?0+$/, "");
}

/**
 * Convert NEAR to yoctoNEAR string
 */
export function nearToYocto(near: string | number): string {
  const amount = typeof near === "string" ? parseFloat(near) : near;
  // Use BigInt math to avoid floating point issues
  const wholePart = Math.floor(amount);
  const fracPart = amount - wholePart;
  const yoctoWhole = BigInt(wholePart) * BigInt("1000000000000000000000000");
  const yoctoFrac = BigInt(Math.round(fracPart * 1e24));
  return (yoctoWhole + yoctoFrac).toString();
}

/**
 * Shorten a NEAR account ID for display
 */
export function shortenAccountId(accountId: string, chars: number = 8): string {
  if (!accountId) return "";
  if (accountId.length <= chars * 2 + 3) return accountId;
  return `${accountId.slice(0, chars)}...${accountId.slice(-chars)}`;
}

/**
 * IPFS gateway fallback URLs
 */
export const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://nftstorage.link/ipfs/",
];

/**
 * Get a working IPFS URL with fallback
 */
export function getIpfsUrl(url: string, gatewayIndex: number = 0): string {
  if (!url) return "";

  // If it's already an HTTP URL, try to swap the gateway
  if (url.startsWith("http")) {
    for (const gw of IPFS_GATEWAYS) {
      if (url.includes(gw)) {
        const cid = url.split(gw)[1];
        if (cid && gatewayIndex < IPFS_GATEWAYS.length) {
          return IPFS_GATEWAYS[gatewayIndex] + cid;
        }
      }
    }
    return url;
  }

  // If it's an ipfs:// URL
  if (url.startsWith("ipfs://")) {
    const cid = url.replace("ipfs://", "");
    if (gatewayIndex < IPFS_GATEWAYS.length) {
      return IPFS_GATEWAYS[gatewayIndex] + cid;
    }
  }

  return url;
}
