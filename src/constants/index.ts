/** NEAR contract and network constants */

export const NEAR_NETWORK = process.env.NEXT_PUBLIC_NEAR_NETWORK || "testnet";

export const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || "your-contract.testnet";

export const NEAR_CONFIG = {
  testnet: {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://testnet.mynearwallet.com",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://testnet.nearblocks.io",
    faucetUrl: "https://near-faucet.io",
  },
  mainnet: {
    networkId: "mainnet",
    nodeUrl: "https://rpc.mainnet.near.org",
    walletUrl: "https://app.mynearwallet.com",
    helperUrl: "https://helper.mainnet.near.org",
    explorerUrl: "https://nearblocks.io",
    faucetUrl: "",
  },
} as const;

export const getConfig = () => {
  return NEAR_CONFIG[NEAR_NETWORK as keyof typeof NEAR_CONFIG] || NEAR_CONFIG.testnet;
};

/** Gas amounts (in TGas — 1 TGas = 10^12 gas) */
export const GAS = {
  DEFAULT: "30000000000000",     // 30 TGas
  MINT: "100000000000000",      // 100 TGas
  DONATE: "50000000000000",     // 50 TGas
  PAY_TO_WATCH: "50000000000000", // 50 TGas
};

/** Deposit amounts (in yoctoNEAR) */
export const DEPOSITS = {
  MINT: "100000000000000000000000",  // 0.1 NEAR
  ONE_YOCTO: "1",                     // 1 yoctoNEAR (for non-payable calls)
};

export const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud";
