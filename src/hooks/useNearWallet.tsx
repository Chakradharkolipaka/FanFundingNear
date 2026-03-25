"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { WalletSelector, AccountState, Wallet } from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { initWalletSelector } from "@/lib/wallet";
import { CONTRACT_ID, GAS } from "@/constants";

// Import wallet selector modal CSS
import "@near-wallet-selector/modal-ui/styles.css";

interface NearWalletContextValue {
  selector: WalletSelector | null;
  modal: WalletSelectorModal | null;
  accounts: AccountState[];
  accountId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  wallet: Wallet | null;
  walletName: string | null;
  signIn: () => void;
  signOut: () => Promise<void>;
  callFunction: (
    methodName: string,
    args: Record<string, unknown>,
    gas?: string,
    deposit?: string
  ) => Promise<unknown>;
}

const NearWalletContext = createContext<NearWalletContextValue>({
  selector: null,
  modal: null,
  accounts: [],
  accountId: null,
  isConnected: false,
  isLoading: true,
  wallet: null,
  walletName: null,
  signIn: () => {},
  signOut: async () => {},
  callFunction: async () => {},
});

export function NearWalletProvider({ children }: { children: ReactNode }) {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<AccountState[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize wallet selector
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    initWalletSelector()
      .then(({ selector: sel, modal: mod }) => {
        setSelector(sel);
        setModal(mod);

        // Set initial accounts
        const state = sel.store.getState();
        setAccounts(state.accounts);

        // Get wallet if already connected
        if (state.selectedWalletId) {
          sel.wallet().then((w) => {
            setWallet(w);
            setWalletName(state.selectedWalletId || null);
          }).catch(console.error);
        }

        // Subscribe to account changes and store for cleanup
        subscription = sel.store.observable.subscribe((state) => {
          setAccounts(state.accounts);
          if (state.selectedWalletId) {
            sel.wallet().then((w) => {
              setWallet(w);
              setWalletName(state.selectedWalletId || null);
            }).catch(() => {
              setWallet(null);
              setWalletName(null);
            });
          } else {
            setWallet(null);
            setWalletName(null);
          }
        });

        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to init wallet selector:", err);
        setIsLoading(false);
      });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const accountId = accounts.find((a) => a.active)?.accountId || null;
  const isConnected = !!accountId;

  // Sign in — shows the wallet selector modal (Meteor Wallet listed first)
  const signIn = useCallback(() => {
    if (modal) {
      modal.show();
    }
  }, [modal]);

  const handleSignOut = useCallback(async () => {
    if (wallet) {
      await wallet.signOut();
      setWallet(null);
      setWalletName(null);
      setAccounts([]);
    }
  }, [wallet]);

  const callFunction = useCallback(
    async (
      methodName: string,
      args: Record<string, unknown>,
      gas: string = GAS.DEFAULT,
      deposit: string = "0"
    ) => {
      if (!wallet || !accountId) {
        throw new Error("Wallet not connected");
      }

      const result = await wallet.signAndSendTransaction({
        receiverId: CONTRACT_ID,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName,
              args,
              gas,
              deposit,
            },
          },
        ],
      });

      return result;
    },
    [wallet, accountId]
  );

  return (
    <NearWalletContext.Provider
      value={{
        selector,
        modal,
        accounts,
        accountId,
        isConnected,
        isLoading,
        wallet,
        walletName,
        signIn,
        signOut: handleSignOut,
        callFunction,
      }}
    >
      {children}
    </NearWalletContext.Provider>
  );
}

export function useNearWallet() {
  const context = useContext(NearWalletContext);
  if (!context) {
    throw new Error("useNearWallet must be used within NearWalletProvider");
  }
  return context;
}
