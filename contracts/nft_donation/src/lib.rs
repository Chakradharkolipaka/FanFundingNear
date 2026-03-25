use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::store::UnorderedMap;
use near_sdk::{env, near_bindgen, AccountId, PanicOnDefault};

mod types;
pub use types::*;

mod donate;
mod mint;
mod pay_per_view;

/// Main contract struct for the NFT Donation platform
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
#[borsh(crate = "near_sdk::borsh")]
pub struct NFTContract {
    /// All minted NFTs, keyed by token_id
    pub nfts: UnorderedMap<u64, NFT>,
    /// View tickets for pay-per-view videos, keyed by "token_id:viewer_account"
    pub view_tickets: UnorderedMap<String, ViewTicket>,
    /// Auto-incrementing token ID counter
    pub next_token_id: u64,
    /// Total number of NFTs minted
    pub total_nfts: u64,
    /// Total NEAR donated across all NFTs (in yoctoNEAR)
    pub total_donated: u128,
    /// Contract owner
    pub owner: AccountId,
}

#[near_bindgen]
impl NFTContract {
    /// Initialize the contract
    #[init]
    pub fn new() -> Self {
        assert!(!env::state_exists(), "Already initialized");
        Self {
            nfts: UnorderedMap::new(b"n"),
            view_tickets: UnorderedMap::new(b"v"),
            next_token_id: 1,
            total_nfts: 0,
            total_donated: 0,
            owner: env::predecessor_account_id(),
        }
    }

    /// Get all NFTs
    pub fn get_all_nfts(&self) -> Vec<NFT> {
        self.nfts.values().cloned().collect()
    }

    /// Get a single NFT by token_id
    pub fn get_nft(&self, token_id: u64) -> Option<NFT> {
        self.nfts.get(&token_id).cloned()
    }

    /// Get total number of NFTs
    pub fn get_total_nfts(&self) -> u64 {
        self.total_nfts
    }

    /// Get total NEAR donated (returns string to avoid JS overflow)
    pub fn get_total_donated(&self) -> String {
        self.total_donated.to_string()
    }

    /// Get contract owner
    pub fn get_owner(&self) -> AccountId {
        self.owner.clone()
    }

    /// Get paginated NFTs
    pub fn get_nfts_paginated(&self, from_index: u64, limit: u64) -> Vec<NFT> {
        self.nfts
            .values()
            .skip(from_index as usize)
            .take(limit as usize)
            .cloned()
            .collect()
    }
}
