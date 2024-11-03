#[starknet::contract]
mod PeerProtocol {
    #[derive(Drop, Serde)]
    struct UserDeposit {
        token: ContractAddress,
        amount: u256,
    }

    use peer_protocol::interfaces::ipeer_protocol::IPeerProtocol;
    use peer_protocol::interfaces::ierc20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address, get_contract_address, contract_address_const};
    use core::starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, 
        Map, StoragePathEntry, MutableVecTrait, Vec, VecTrait
    };

    #[storage]
    struct Storage {
        owner: ContractAddress,
        supported_tokens: Map<ContractAddress, bool>,
        supported_token_list: Vec<ContractAddress>,
        // Mapping: (user, token) => deposited amount
        token_deposits: Map<(ContractAddress, ContractAddress), u256>,
        // Mapping: (user, token) => borrowed amount
        borrowed_assets: Map<(ContractAddress, ContractAddress), u256>,
        // Mapping: (user, token) => lent amount
        lent_assets: Map<(ContractAddress, ContractAddress), u256>,
        // Mapping: (user, token) => interest earned
        interests_earned: Map<(ContractAddress, ContractAddress), u256>,
    }

    #[derive(Drop, Serde)]
    struct UserAssets {
        token_address: ContractAddress,
        total_lent: u256,
        total_borrowed: u256,
        interest_earned: u256,
        available_balance: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        DepositSuccessful: DepositSuccessful,
        SupportedTokenAdded: SupportedTokenAdded,
        WithdrawalSuccessful: WithdrawalSuccessful,
    }

    #[derive(Drop, starknet::Event)]
    pub struct DepositSuccessful {
        pub user: ContractAddress,
        pub token: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct SupportedTokenAdded {
        token: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        assert!(owner != contract_address_const::<0>(), "zero address detected");
        self.owner.write(owner);
    }

    #[derive(Drop, starknet::Event)]
    pub struct WithdrawalSuccessful {
        pub user: ContractAddress,
        pub token: ContractAddress,
        pub amount: u256,
    }


    #[abi(embed_v0)]
    impl PeerProtocolImpl of IPeerProtocol<ContractState> {
        fn deposit(ref self: ContractState, token_address: ContractAddress, amount: u256) {
            assert!(self.supported_tokens.entry(token_address).read(), "token not supported");
            assert!(amount > 0, "can't deposit zero value");

            let caller = get_caller_address();
            let this_contract = get_contract_address();
            let token = IERC20Dispatcher { contract_address: token_address };

            let transfer = token.transfer_from(caller, this_contract, amount);
            assert!(transfer, "transfer failed");

            let prev_deposit = self.token_deposits.entry((caller, token_address)).read();

            self.token_deposits.entry((caller, token_address)).write(prev_deposit + amount);

            self.emit(DepositSuccessful {user: caller, token: token_address, amount: amount});
        }

        fn add_supported_token(ref self: ContractState, token_address: ContractAddress) {
            let caller = get_caller_address();

            assert!(caller == self.owner.read(), "unauthorized caller");
            assert!(self.supported_tokens.entry(token_address).read() == false, "token already added");

            self.supported_tokens.entry(token_address).write(true);
            self.supported_token_list.append().write(token_address);

            self.emit(SupportedTokenAdded { token: token_address });
        }

        fn withdraw(ref self: ContractState, token_address: ContractAddress, amount: u256) {
            assert!(self.supported_tokens.entry(token_address).read(), "token not supported");
            assert!(amount > 0, "can't withdraw zero value");
            let caller = get_caller_address();
            let key = (caller, token_address);
            let current_balance = self.token_deposits.entry(key).read();
            assert!(amount <= current_balance, "insufficient balance");
        
            self.token_deposits.entry(key).write(current_balance - amount);
        
            let token = IERC20Dispatcher { contract_address: token_address };
            let transfer = token.transfer(caller, amount);
            assert!(transfer, "transfer failed");
                
            self.emit(WithdrawalSuccessful {
                user: caller,
                token: token_address,
                amount: amount,
            });
        }

        fn get_user_assets(self: @ContractState, user: ContractAddress) -> Array<UserAssets> {
            let mut user_assets: Array<UserAssets> = ArrayTrait::new();

            for i in 0..self.supported_token_list.len() {
                let supported_token = self.supported_token_list.at(i).read();

                let total_deposits = self.token_deposits.entry((user, supported_token)).read();
                let total_borrowed = self.borrowed_assets.entry((user, supported_token)).read();
                let total_lent = self.lent_assets.entry((user, supported_token)).read();
                let interest_earned = self.interests_earned.entry((user, supported_token)).read();

                let available_balance = if total_borrowed == 0 {
                    total_deposits
                } else {
                    match total_deposits > total_borrowed {
                        true => total_deposits - total_borrowed,
                        false => 0
                    }
                };

                let token_assets = UserAssets {
                    token_address: supported_token,
                    total_lent,
                    total_borrowed,
                    interest_earned,
                    available_balance
                };

                if total_deposits > 0 || total_lent > 0 || total_borrowed > 0 {
                    user_assets.append(token_assets);
                }
            };

            user_assets
        }

        /// Returns all active deposits for a given user across supported tokens
        /// @param user The address of the user whose deposits to retrieve
        /// @return A Span of UserDeposit structs containing only tokens with non-zero balances
        ///
        /// The method:
        /// - Filters out tokens with zero balances
        /// - Returns empty span if user has no deposits
        /// - Includes token address and amount for each active deposit

        fn get_user_deposits(self: @ContractState, user: ContractAddress) -> Span<UserDeposit> {
            assert!(user != contract_address_const::<0>(), "invalid user address");

            let mut user_deposits = array![];
            for i in 0..self.supported_token_list.len() {
                let token = self.supported_token_list.at(i).read();
                let deposit = self.token_deposits.entry((user, token)).read();
                if deposit > 0 {
                    user_deposits.append(UserDeposit { token: token, amount: deposit });
                }
            };
            user_deposits.span()
        }
    }
}