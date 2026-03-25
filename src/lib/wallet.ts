"use client";

import { setupWalletSelector } from "@near-wallet-selector/core";
import type { WalletSelector, Wallet, AccountState } from "@near-wallet-selector/core";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupModal } from "@near-wallet-selector/modal-ui";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { CONTRACT_ID, NEAR_NETWORK } from "@/constants";

/** Meteor Wallet Chrome Extension install URL */
export const METEOR_EXTENSION_URL =
  "https://chromewebstore.google.com/detail/meteor-wallet/pcndjhkinnkaohffealmlmhaepkpmgkb";

let walletSelectorInstance: WalletSelector | null = null;
let modalInstance: WalletSelectorModal | null = null;

/**
 * Initialize the NEAR Wallet Selector with Meteor Wallet as the primary wallet.
 * Meteor is listed first so it appears as the recommended option.
 */
export async function initWalletSelector(): Promise<{
  selector: WalletSelector;
  modal: WalletSelectorModal;
}> {
  if (walletSelectorInstance && modalInstance) {
    return { selector: walletSelectorInstance, modal: modalInstance };
  }

  const selector = await setupWalletSelector({
    network: NEAR_NETWORK as "testnet" | "mainnet",
    modules: [
      // Meteor Wallet is the primary/recommended wallet
      setupMeteorWallet(),
      setupMyNearWallet(),
      setupHereWallet(),
    ],
  });

  const modal = setupModal(selector, {
    contractId: CONTRACT_ID,
    description: "Connect with Meteor Wallet (recommended) or another NEAR wallet.",
  });

  walletSelectorInstance = selector;
  modalInstance = modal;

  return { selector, modal };
}

/**
 * Get the current wallet selector instance
 */
export function getWalletSelector(): WalletSelector | null {
  return walletSelectorInstance;
}

/**
 * Get the current modal instance
 */
export function getModal(): WalletSelectorModal | null {
  return modalInstance;
}

/**
 * Get the currently connected wallet
 */
export async function getWallet(): Promise<Wallet | null> {
  if (!walletSelectorInstance) return null;
  const state = walletSelectorInstance.store.getState();
  if (!state.selectedWalletId) return null;
  try {
    return await walletSelectorInstance.wallet();
  } catch {
    return null;
  }
}

/**
 * Get the currently connected accounts
 */
export function getAccounts(): AccountState[] {
  if (!walletSelectorInstance) return [];
  return walletSelectorInstance.store.getState().accounts;
}

/**
 * Sign out from the current wallet
 */
export async function signOut(): Promise<void> {
  const wallet = await getWallet();
  if (wallet) {
    await wallet.signOut();
  }
}
