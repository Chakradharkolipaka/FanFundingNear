use crate::*;
use near_sdk::{env, near_bindgen, NearToken, Promise};

#[near_bindgen]
impl NFTContract {
    /// Donate NEAR to an NFT creator
    /// The attached deposit is transferred directly to the NFT creator
    #[payable]
    pub fn donate(&mut self, token_id: u64) -> NFT {
        let deposit = env::attached_deposit();
        assert!(
            deposit > NearToken::from_yoctonear(0),
            "Must attach NEAR to donate"
        );

        let mut nft = self.nfts.get(&token_id).expect("NFT not found").clone();
        let donor = env::predecessor_account_id();

        assert!(donor != nft.creator, "Cannot donate to yourself");

        // Update donation stats
        nft.total_donated += deposit.as_yoctonear();
        nft.donation_count += 1;
        self.nfts.insert(token_id, nft.clone());

        // Update global donation counter
        self.total_donated += deposit.as_yoctonear();

        // Transfer the donation to the creator
        Promise::new(nft.creator.clone()).transfer(deposit);

        env::log_str(&format!(
            "Donation of {} yoctoNEAR from {} to {} for NFT #{}",
            deposit.as_yoctonear(),
            donor,
            nft.creator,
            token_id
        ));

        nft
    }
}
