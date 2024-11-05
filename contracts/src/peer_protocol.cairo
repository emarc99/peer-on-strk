use core::array::ArrayTrait;
use starknet::{ContractAddress, get_block_timestamp};

#[derive(Drop, Serde)]
enum TransactionType {
    DEPOSIT,
    WITHDRAWAL
}

#[derive(Drop, Serde, starknet::Store)]
struct Transaction {
    transaction_type: TransactionType,
    token: ContractAddress,
    amount: u256,
    timestamp: u64,
    tx_hash: felt252,
}

#[derive(Drop, Serde)]
struct UserDeposit {
    token: ContractAddress,
    amount: u256,
}

#[derive(Drop, Serde)]
struct UserAssets {
    token_address: ContractAddress,
    total_lent: u256,
    total_borrowed: u256,
    interest_earned: u256,
    available_balance: u256,
}

#[starknet::contract]
mod PeerProtocol {
    use super::{Transaction, TransactionType, UserDeposit, UserAssets};
    use peer_protocol::interfaces::ipeer_protocol::IPeerProtocol;
    use peer_protocol::interfaces::ierc20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::{
        ContractAddress, 
        get_block_timestamp, 
        get_caller_address, 
        get_contract_address, 
        contract_address_const,
        get_tx_info
    };
    use core::starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, 
        Map, StoragePathEntry, MutableVecTrait, Vec, VecTrait
    };
    use core::array::ArrayTrait;

    const MAX_TRANSACTIONS_PER_USER: usize = 100;
    const DUPLICATE_WINDOW: u64 = 3600; // 1 hour in seconds

    #[storage]
    struct Storage {
        owner: ContractAddress,
        supported_tokens: Map<ContractAddress, bool>,
        supported_token_list: Vec<ContractAddress>,
        // Mapping: (user, token) => deposited amount
        token_deposits: Map<(ContractAddress, ContractAddress), u256>,
        // Transaction history
        user_transactions: Map<ContractAddress, Array<Transaction>>,
        // Mapping: (user, token) => borrowed amount
        borrowed_assets: Map<(ContractAddress, ContractAddress), u256>,
        // Mapping: (user, token) => lent amount
        lent_assets: Map<(ContractAddress, ContractAddress), u256>,
        // Mapping: (user, token) => interest earned
        interests_earned: Map<(ContractAddress, ContractAddress), u256>,
        // Mapping: (user, tx_hash) => bool for duplicate transaction checking
        processed_tx_hashes: Map<(ContractAddress, felt252), bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        DepositSuccessful: DepositSuccessful,
        SupportedTokenAdded: SupportedTokenAdded,
        WithdrawalSuccessful: WithdrawalSuccessful,
        TransactionRecorded: TransactionRecorded,
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

    #[derive(Drop, starknet::Event)]
    pub struct WithdrawalSuccessful {
        pub user: ContractAddress,
        pub token: ContractAddress,
        pub amount: u256,
    }

    /// Emitted when a transaction (deposit/withdrawal) is recorded
    /// @param user The address of the user who performed the transaction
    /// @param transaction_type Type of transaction (DEPOSIT/WITHDRAWAL)
    /// @param token Address of the token involved
    /// @param amount Amount of tokens in the transaction
    /// @param timestamp Block timestamp of the transaction
    /// @param tx_hash Transaction hash for verification
    #[derive(Drop, starknet::Event)]
    pub struct TransactionRecorded {
        pub user: ContractAddress,
        pub transaction_type: TransactionType,
        pub token: ContractAddress,
        pub amount: u256,
        pub timestamp: u64,
        pub tx_hash: felt252,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        assert!(owner != contract_address_const::<0>(), "zero address detected");
        self.owner.write(owner);
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

            // Record transaction
            let timestamp = get_block_timestamp();
            let tx_info = get_tx_info().unwrap();
            let transaction = Transaction {
                transaction_type: TransactionType::DEPOSIT,
                token: token_address,
                amount,
                timestamp,
                tx_hash: tx_info.transaction_hash,
            };
            match self._add_transaction(caller, transaction.clone()) {
                Result::Ok(_) => {},
                Result::Err(e) => panic!("Failed to record transaction"),
            }

            self.emit(TransactionRecorded { user: caller, ..transaction });

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

            // Record transaction
            let timestamp = get_block_timestamp();
            let tx_info = get_tx_info().unwrap();
            let transaction = Transaction {
                transaction_type: TransactionType::WITHDRAWAL,
                token: token_address,
                amount,
                timestamp,
                tx_hash: tx_info.transaction_hash,
            };
            match self._add_transaction(caller, transaction.clone()) {
                Result::Ok(_) => {},
                Result::Err(e) => panic!("Failed to record transaction"),
            }
            
            self.emit(TransactionRecorded { user: caller, ..transaction });
                
            self.emit(WithdrawalSuccessful {
                user: caller,
                token: token_address,
                amount: amount,
            });
        }

        /// Retrieves transaction history for a given user
        /// @param user The address of the user whose transaction history to retrieve
        /// @return Array of Transaction structs containing:
        ///   - transaction_type: Type of transaction (DEPOSIT/WITHDRAWAL)
        ///   - token: Address of the token involved
        ///   - amount: Amount of tokens in the transaction
        ///   - timestamp: Block timestamp of the transaction
        ///   - tx_hash: Transaction hash for verification on block explorer
        fn get_transaction_history(
            self: @ContractState,
            user: ContractAddress,
            offset: usize,
            limit: usize
        ) -> Array<Transaction> {
            let transactions = self.user_transactions.entry(user).read();
            if transactions.len() == 0 {
                return ArrayTrait::new();
            }
            let end = if offset + limit > transactions.len() {
                transactions.len()
            } else {
                offset + limit
            };
            let mut result = ArrayTrait::new();
            let mut i = offset;
            while i < end {
                result.append(*transactions.at(i));
                i += 1;
            }
            result
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

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _add_transaction(ref self: ContractState, user: ContractAddress, transaction: Transaction) -> Result<(), felt252> {
            let mut transactions = self.user_transactions.entry(user).read();

             // Check size limit
            if transactions.len() >= MAX_TRANSACTIONS_PER_USER {
                return Result::Err('max transactions reached');
            }
            
            // Check for duplicate transaction using mapping
            let processed = self.processed_tx_hashes.entry((user, transaction.tx_hash)).read();
            if processed && transaction.timestamp - processed <= DUPLICATE_WINDOW {
                    return Result::Err('duplicate transaction');
            }

            transactions.append(transaction);
            self.user_transactions.entry(user).write(transactions);
            self.processed_tx_hashes.entry((user, transaction.tx_hash)).write(true);
            Result::Ok(())
        }
    }
}