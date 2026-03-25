use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::AccountId;

/// Represents an NFT with donation and pay-per-view capabilities
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct NFT {
    pub id: u64,
    pub creator: AccountId,
    pub name: String,
    pub description: String,
    pub image_url: String,
    pub metadata_url: String,
    pub is_video: bool,
    pub view_price: u128,    // in yoctoNEAR (0 means free)
    pub total_donated: u128, // in yoctoNEAR
    pub donation_count: u64,
    pub created_at: u64, // block timestamp in nanoseconds
}

/// Represents a pay-per-view ticket for a video NFT
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct ViewTicket {
    pub token_id: u64,
    pub viewer: AccountId,
    pub paid_at: u64, // block timestamp in nanoseconds
}
