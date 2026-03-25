use crate::*;
use near_sdk::{env, near_bindgen, NearToken};

/// Minimum deposit required to mint an NFT (0.1 NEAR)
const MIN_MINT_DEPOSIT: NearToken = NearToken::from_millinear(100);

#[near_bindgen]
impl NFTContract {
    /// Mint a new image NFT
    /// Requires a minimum deposit of 0.1 NEAR for storage
    #[payable]
    pub fn mint_nft(
        &mut self,
        name: String,
        description: String,
        image_url: String,
        metadata_url: String,
    ) -> NFT {
        let deposit = env::attached_deposit();
        assert!(
            deposit >= MIN_MINT_DEPOSIT,
            "Minimum deposit of 0.1 NEAR required to mint"
        );

        let creator = env::predecessor_account_id();
        let token_id = self.next_token_id;
        self.next_token_id += 1;

        let nft = NFT {
            id: token_id,
            creator,
            name,
            description,
            image_url,
            metadata_url,
            is_video: false,
            view_price: 0,
            total_donated: 0,
            donation_count: 0,
            created_at: env::block_timestamp(),
        };

        self.nfts.insert(token_id, nft.clone());
        self.total_nfts += 1;

        env::log_str(&format!("NFT minted with id: {}", token_id));
        nft
    }

    /// Mint a new video NFT with a pay-per-view price
    /// Requires a minimum deposit of 0.1 NEAR for storage
    #[payable]
    pub fn mint_video_nft(
        &mut self,
        name: String,
        description: String,
        image_url: String,
        metadata_url: String,
        view_price: String, // yoctoNEAR as string to avoid JS number overflow
    ) -> NFT {
        let deposit = env::attached_deposit();
        assert!(
            deposit >= MIN_MINT_DEPOSIT,
            "Minimum deposit of 0.1 NEAR required to mint"
        );

        let parsed_price: u128 = view_price
            .parse()
            .expect("Invalid view price: must be a valid number string");
        assert!(parsed_price > 0, "Video NFT must have a view price > 0");

        let creator = env::predecessor_account_id();
        let token_id = self.next_token_id;
        self.next_token_id += 1;

        let nft = NFT {
            id: token_id,
            creator,
            name,
            description,
            image_url,
            metadata_url,
            is_video: true,
            view_price: parsed_price,
            total_donated: 0,
            donation_count: 0,
            created_at: env::block_timestamp(),
        };

        self.nfts.insert(token_id, nft.clone());
        self.total_nfts += 1;

        env::log_str(&format!(
            "Video NFT minted with id: {}, view_price: {}",
            token_id, parsed_price
        ));
        nft
    }
}
