use crate::*;
use near_sdk::{env, near_bindgen, NearToken, Promise};

#[near_bindgen]
impl NFTContract {
    /// Pay to watch a video NFT
    /// The attached deposit must be >= the video's view_price
    /// Payment is transferred to the NFT creator
    #[payable]
    pub fn pay_to_watch(&mut self, token_id: u64) -> ViewTicket {
        let deposit = env::attached_deposit();
        let viewer = env::predecessor_account_id();

        let nft = self.nfts.get(&token_id).expect("NFT not found").clone();

        assert!(nft.is_video, "This NFT is not a video");
        assert!(nft.view_price > 0, "This video is free to watch");
        assert!(
            deposit >= NearToken::from_yoctonear(nft.view_price),
            "Insufficient payment. Required: {} yoctoNEAR",
            nft.view_price
        );

        // Create a unique key for the viewer's ticket
        let ticket_key = format!("{}:{}", token_id, viewer);

        // Check if already purchased
        assert!(
            self.view_tickets.get(&ticket_key).is_none(),
            "You already have a view ticket for this NFT"
        );

        let ticket = ViewTicket {
            token_id,
            viewer: viewer.clone(),
            paid_at: env::block_timestamp(),
        };

        self.view_tickets.insert(ticket_key, ticket.clone());

        // Transfer payment to creator
        Promise::new(nft.creator.clone()).transfer(deposit);

        env::log_str(&format!(
            "View ticket purchased: {} paid {} yoctoNEAR to watch NFT #{}",
            viewer, deposit.as_yoctonear(), token_id
        ));

        ticket
    }

    /// Check if a viewer has a view ticket for a specific NFT
    pub fn has_view_ticket(&self, token_id: u64, viewer: String) -> bool {
        let ticket_key = format!("{}:{}", token_id, viewer);
        self.view_tickets.get(&ticket_key).is_some()
    }
}
