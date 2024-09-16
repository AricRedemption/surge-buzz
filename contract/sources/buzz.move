#[allow(unused_function, unused_use, unused_variable, unused_mut_parameter)]
module surge::buzz{
    use sui::event;
    use sui::tx_context::{sender};
    use std::string::{Self, String};
    use sui::table::{Self, Table};

    #[test_only]
    use sui::test_scenario::{Self, ctx};
    #[test_only]
    use sui::test_utils::assert_eq;

    //==============================================================================================
    // Constants
    //==============================================================================================
    
    
    //==============================================================================================
    // Error codes
    //==============================================================================================
    /// Only creator can mint 
    const ENotCreator: u64 = 0;
    // No accoount created yet
    const ENoAccount: u64 = 0;

    //==============================================================================================
    // Structs 
    //==============================================================================================
    public struct State has key {
        id: UID,
        creators: Table<address, TweetCollection>,
        tweet_count: u64,
        all_tweets: vector<ID>,
        minted_tweets: vector<ID>
    }

    public struct Profile has key, store{
        id: UID,
        owner: address,
        photo_blob: String,
        username: String
    }

    public struct TweetCollection has store{
        creator: address,
        tweets: vector<ID> //<Tweet_ID>
    }

    public struct Tweet has key{
        id: UID,
        creator: address,
        content: String, //blob_id
        likes: u64,
        comments: vector<String> //<blob_id of each comment>
    }

    public struct MintedTweet has key, store{
        id: UID,
        tweet_id: ID,
        image_blob_id: String,
        creator: address,
        content: String, //blob_id
        likes: u64,
        comments_count: u64
    }

    //==============================================================================================
    // Event Structs 
    //==============================================================================================

    public struct TweetCreated has copy, drop {
        id: ID,
        creator: address,
        content: String, //blob_id
    }

    public struct TweetMinted has copy, drop {
        obj_id: ID,
        tweet_id: ID,
        creator: address,
        image_blob_id: String,
        content: String, //blob_id
        likes: u64,
        comments_count: u64
    }

    public struct TweetLiked has copy, drop {
        tweet_id: ID,
        creator: address,
        liker: address,
        current_likes_count: u64
    }

    public struct TweetCommented has copy, drop {
        tweet_id: ID,
        creator: address,
        commenter: address,
        current_comments_count: u64
    }

    public struct AccountCreated has copy, drop {
        creator: address,
        username: String,
        photo_blob: String
    }

    //==============================================================================================
    // Init
    //==============================================================================================

    fun init(ctx: &mut TxContext) {
        transfer::share_object(State{
            id: object::new(ctx), 
            creators: table::new(ctx), 
            tweet_count: 0, 
            all_tweets: vector::empty(),
            minted_tweets: vector::empty()
        });
    }

    //==============================================================================================
    // Entry Functions 
    //==============================================================================================

    public entry fun create_account(
        username: String,
        photo_blob: String,
        state: &mut State,
        ctx: &mut TxContext
    ){
        let creator = tx_context::sender(ctx);
        if(!table::contains(&state.creators, creator)){
            table::add(&mut state.creators, creator, TweetCollection{creator, tweets: vector::empty()})
        };
        let profile = Profile{
            id: object::new(ctx),
            owner: creator,
            photo_blob,
            username
        };
        transfer::public_transfer(profile, creator);
        event::emit(AccountCreated{
            creator,
            username,
            photo_blob
        });
    }

    public entry fun create_tweet(
        content: String, //blob_id
        state: &mut State,
        ctx: &mut TxContext
    ){
        let creator = tx_context::sender(ctx);
        assert!(table::contains(&state.creators, creator), ENoAccount);
        let creator_tweet_collection = table::borrow_mut(&mut state.creators, creator);
        let uid = object::new(ctx);
        let id = object::uid_to_inner(&uid);
        let new_tweet = Tweet{
            id: uid,
            creator,
            content,
            likes: 0,
            comments: vector::empty()
        };
        transfer::share_object(new_tweet);
        vector::push_back(&mut creator_tweet_collection.tweets, id);
        vector::push_back(&mut state.all_tweets, id);
        event::emit(TweetCreated{
            id,
            creator,
            content
        });
        state.tweet_count = state.tweet_count + 1;
    }

    public entry fun like_tweet(
        tweet: &mut Tweet,
        state: &mut State,
        ctx: &mut TxContext
    ){
        let liker = tx_context::sender(ctx);
        assert!(table::contains(&state.creators, liker), ENoAccount);
        tweet.likes = tweet.likes + 1;
        event::emit(TweetLiked{
            tweet_id: object::uid_to_inner(&tweet.id),
            creator: tweet.creator,
            liker,
            current_likes_count: tweet.likes
        });
    }

    public entry fun comment(
        tweet: &mut Tweet,
        comment: String, //blob_id
        state: &mut State,
        ctx: &mut TxContext
    ){
        let commenter = tx_context::sender(ctx);
        assert!(table::contains(&state.creators, commenter), ENoAccount);
        vector::push_back(&mut tweet.comments, comment);
        event::emit(TweetCommented{
            tweet_id: object::uid_to_inner(&tweet.id),
            creator: tweet.creator,
            commenter,
            current_comments_count: vector::length(&tweet.comments)
        });
    }

    // not ready, need to discuss
    entry fun mint_tweet(
        tweet: &mut Tweet,
        state: &mut State,
        image_blob_id: String,
        ctx: &mut TxContext
    ){
        let creator = tx_context::sender(ctx);
        assert!(tweet.creator == creator, ENotCreator);
        let uid = object::new(ctx);
        let id = object::uid_to_inner(&uid);
        let tweet_id = object::uid_to_inner(&tweet.id);
        let comments_count = vector::length(&tweet.comments);
        let nft = MintedTweet {
            id: uid,
            tweet_id,
            image_blob_id,
            creator,
            content: tweet.content, 
            likes: tweet.likes,
            comments_count
        };
        event::emit(TweetMinted {
            obj_id: id,
            tweet_id,
            creator,
            image_blob_id, 
            content: tweet.content,
            likes: tweet.likes,
            comments_count
        });
        vector::push_back(&mut state.minted_tweets, id);
        transfer::public_transfer(nft, creator);
    }

    //==============================================================================================
    // Getter Functions 
    //==============================================================================================

    

    //==============================================================================================
    // Helper Functions 
    //==============================================================================================

    fun num_to_string(num: u64): String {
        let mut num_vec = vector::empty<u8>();
        let mut n = num;
        if (n == 0) {
            vector::push_back(&mut num_vec, 48);
        } else {
            while (n != 0) {
                let mod = n % 10 + 48;
                vector::push_back(&mut num_vec, (mod as u8));
                n = n / 10;
            };
        };

        vector::reverse(&mut num_vec);
        string::utf8(num_vec)
    }

    //==============================================================================================
    // Tests 
    //==============================================================================================
    #[test]
    fun test_init_success() {
        let module_owner = @0xa;

        let mut scenario_val = test_scenario::begin(module_owner);
        let scenario = &mut scenario_val;

        {
            init(test_scenario::ctx(scenario));
        };
        let tx = test_scenario::next_tx(scenario, module_owner);
        let expected_events_emitted = 0;
        let expected_created_objects = 1;
        assert_eq(
            test_scenario::num_user_events(&tx), 
            expected_events_emitted
        );
        assert_eq(
            vector::length(&test_scenario::created(&tx)),
            expected_created_objects
        );
        test_scenario::end(scenario_val);
    }
}