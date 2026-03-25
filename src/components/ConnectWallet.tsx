"use client";

import { useNearWallet } from "@/hooks/useNearWallet";
import { METEOR_EXTENSION_URL } from "@/lib/wallet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { shortenAccountId } from "@/lib/utils";
import { getConfig } from "@/constants";
import { Wallet, LogOut, ExternalLink, Loader2, Download } from "lucide-react";

/** Meteor Wallet icon SVG (orange gradient) */
function MeteorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" fill="url(#meteor-grad)" />
      <path
        d="M8 16L16 8M16 8H10M16 8V14"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="meteor-grad" x1="2" y1="2" x2="22" y2="22">
          <stop stopColor="#FD6A0A" />
          <stop offset="1" stopColor="#E85D04" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ConnectWallet() {
  const { isConnected, isLoading, accountId, walletName, signIn, signOut } =
    useNearWallet();
  const config = getConfig();

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (!isConnected || !accountId) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={signIn}
          size="sm"
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
        >
          <MeteorIcon className="mr-2 h-4 w-4" />
          Connect Meteor
        </Button>
        <a
          href={METEOR_EXTENSION_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Install Meteor Wallet extension"
        >
          <Button variant="ghost" size="sm" className="text-muted-foreground px-2">
            <Download className="h-4 w-4" />
          </Button>
        </a>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono text-xs">
          <MeteorIcon className="mr-2 h-4 w-4" />
          {shortenAccountId(accountId)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-mono text-xs truncate">
          {accountId}
        </DropdownMenuLabel>
        {walletName && (
          <p className="px-2 pb-1 text-[10px] text-muted-foreground">
            via {walletName}
          </p>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a
            href={`${config.explorerUrl}/address/${accountId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={METEOR_EXTENSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Download className="mr-2 h-4 w-4" />
            Get Meteor Wallet
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
