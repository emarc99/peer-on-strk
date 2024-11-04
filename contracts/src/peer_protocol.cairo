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

#[starknet::contract]
mod PeerProtocol {
    use super::{Transaction, TransactionType};
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
        Map, StoragePathEntry
    };
    use core::array::ArrayTrait;

    #[storage]
    struct Storage {
        owner: ContractAddress,
        supported_tokens: Map<ContractAddress, bool>,
        token_deposits: Map<(ContractAddress, ContractAddress), u256>,
        user_transactions: Map<ContractAddress, Array<Transaction>>,
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
            self._add_transaction(caller, transaction);

            self.emit(TransactionRecorded {
                user: caller,
                transaction_type: TransactionType::DEPOSIT,
                token: token_address,
                amount,
                timestamp,
                tx_hash: tx_info.transaction_hash,
            });

            self.emit(DepositSuccessful {user: caller, token: token_address, amount: amount});
        }

        fn add_supported_token(ref self: ContractState, token_address: ContractAddress) {
            let caller = get_caller_address();

            assert!(caller == self.owner.read(), "unauthorized caller");
            assert!(self.supported_tokens.entry(token_address).read() == false, "token already added");

            self.supported_tokens.entry(token_address).write(true);

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
            self._add_transaction(caller, transaction);
            self.emit(TransactionRecorded {
                user: caller,
                transaction_type: TransactionType::WITHDRAWAL,
                token: token_address,
                amount,
                timestamp,
                tx_hash: tx_info.transaction_hash,
            });
                
            self.emit(WithdrawalSuccessful {
            user: caller,
            token: token_address,
            amount: amount,
            });
        }

        fn get_transaction_history(self: @ContractState, user: ContractAddress) -> Array<Transaction> {
            let transactions = self.user_transactions.entry(user).read();
            if transactions.len() == 0 {
                return ArrayTrait::new();
            }
            transactions
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _add_transaction(ref self: ContractState, user: ContractAddress, transaction: Transaction) {
            let mut transactions = self.user_transactions.entry(user).read();
            transactions.append(transaction);
            self.user_transactions.entry(user).write(transactions);
        }
    }
}