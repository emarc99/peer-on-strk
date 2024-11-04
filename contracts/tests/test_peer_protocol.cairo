use starknet::{ContractAddress, get_contract_address};
use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, DeclareResult, start_cheat_caller_address,
    stop_cheat_caller_address, spy_events, EventSpyAssertionsTrait, start_prank, stop_prank,
    CheatTarget, set_block_timestamp, get_tx_hash
};

use peer_protocol::interfaces::ipeer_protocol::{
    IPeerProtocolDispatcher, IPeerProtocolDispatcherTrait
};
use peer_protocol::peer_protocol::PeerProtocol;
use peer_protocol::{Transaction, TransactionType};
use peer_protocol::interfaces::ierc20::{IERC20Dispatcher, IERC20DispatcherTrait};

const ONE_E18: u256 = 1000000000000000000_u256;

fn deploy_token(name: ByteArray) -> ContractAddress {
    let contract = declare(name).unwrap().contract_class();
    let (contract_address, _) = contract.deploy(@ArrayTrait::new()).unwrap();
    contract_address
}

fn deploy_peer_protocol() -> ContractAddress {
    let owner: ContractAddress = starknet::contract_address_const::<0x123626789>();
    let mut constructor_calldata = ArrayTrait::new();
    constructor_calldata.append(owner.into());

    let contract = declare("PeerProtocol").unwrap().contract_class();
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
    contract_address
}

#[test]
#[should_panic(expected: "token not supported")]
fn test_deposit_should_panic_for_unsupported_token() {
    let token_address = deploy_token("MockToken");
    let peer_protocol_address = deploy_peer_protocol();

    let token = IERC20Dispatcher { contract_address: token_address };
    let caller: ContractAddress = starknet::contract_address_const::<0x122226789>();
    let mint_amount: u256 = 1000 * ONE_E18;

    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };

    token.mint(caller, mint_amount);

    // Approving peer_protocol contract to spend mock_token
    start_cheat_caller_address(token_address, caller);
    token.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token_address);

    // Prank caller to deposit into peer protocol
    start_cheat_caller_address(peer_protocol_address, caller);
    let deposit_amount: u256 = 100 * ONE_E18;
    peer_protocol.deposit(token_address, deposit_amount);
    stop_cheat_caller_address(peer_protocol_address);
}

#[test]
fn test_deposit() {
    let token_address = deploy_token("MockToken");
    let peer_protocol_address = deploy_peer_protocol();

    let token = IERC20Dispatcher { contract_address: token_address };
    let caller: ContractAddress = starknet::contract_address_const::<0x122226789>();
    let mint_amount: u256 = 1000 * ONE_E18;

    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };
    let owner: ContractAddress = starknet::contract_address_const::<0x123626789>();

    // Prank owner to add supported token in peer protocol
    start_cheat_caller_address(peer_protocol_address, owner);
    peer_protocol.add_supported_token(token_address);
    stop_cheat_caller_address(peer_protocol_address);

    token.mint(caller, mint_amount);

    // Approving peer_protocol contract to spend mock_token
    start_cheat_caller_address(token_address, caller);
    token.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token_address);

    // Set initial timestamp
    let initial_timestamp: u64 = 1000;
    set_block_timestamp(initial_timestamp);

    // Prank caller to deposit into peer protocol
    start_cheat_caller_address(peer_protocol_address, caller);
    let deposit_amount: u256 = 100 * ONE_E18;
    let mut spy = spy_events();

    peer_protocol.deposit(token_address, deposit_amount);

    // testing peer_protocol contract balance increase
    assert!(token.balance_of(peer_protocol_address) == deposit_amount, "deposit failed");

    // Get transaction hash
    let tx_hash = get_tx_hash();

    // testing emitted deposit successful event
    let expected_deposit_event = PeerProtocol::Event::DepositSuccessful(
        PeerProtocol::DepositSuccessful {
            user: caller,
            token: token_address,
            amount: deposit_amount
        }
    );
    spy.assert_emitted(@array![(peer_protocol_address, expected_deposit_event)]);

    // testing emitted transaction recorded event
    let expected_tx_event = PeerProtocol::Event::TransactionRecorded(
        PeerProtocol::TransactionRecorded {
            user: caller,
            transaction_type: TransactionType::DEPOSIT,
            token: token_address,
            amount: deposit_amount,
            timestamp: initial_timestamp,
            tx_hash,
        }
    );
    spy.assert_emitted(@array![(peer_protocol_address, expected_tx_event)]);

    stop_cheat_caller_address(peer_protocol_address);
}

#[test]
fn test_withdraw() {
    let token_address = deploy_token("MockToken");
    let peer_protocol_address = deploy_peer_protocol();

    let token = IERC20Dispatcher { contract_address: token_address };
    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };

    let owner: ContractAddress = starknet::contract_address_const::<0x123626789>();
    let caller: ContractAddress = starknet::contract_address_const::<0x122226789>();

    let mint_amount: u256 = 1000 * ONE_E18;
    let deposit_amount: u256 = 100 * ONE_E18;
    let withdraw_amount: u256 = 50 * ONE_E18;

    start_cheat_caller_address(peer_protocol_address, owner);
    peer_protocol.add_supported_token(token_address);
    stop_cheat_caller_address(peer_protocol_address);

    // Set initial timestamp
    let initial_timestamp: u64 = 1000;
    set_block_timestamp(initial_timestamp);

    // Mint tokens
    token.mint(caller, mint_amount);

    start_cheat_caller_address(token_address, caller);
    token.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token_address);

    start_cheat_caller_address(peer_protocol_address, caller);
    peer_protocol.deposit(token_address, deposit_amount);

    // Set withdrawal timestamp
    let withdrawal_timestamp: u64 = initial_timestamp + 3600;
    set_block_timestamp(withdrawal_timestamp);

    let mut spy = spy_events();
    peer_protocol.withdraw(token_address, withdraw_amount);

    // Get transaction hash
    let tx_hash = get_tx_hash();

    assert!(
        token.balance_of(peer_protocol_address) == deposit_amount - withdraw_amount,
        "incorrect protocol balance after withdrawal"
    );
    assert!(
        token.balance_of(caller) == mint_amount - deposit_amount + withdraw_amount,
        "incorrect user balance after withdrawal"
    );

    // Check withdrawal successful event
    let expected_withdraw_event = PeerProtocol::Event::WithdrawalSuccessful(
        PeerProtocol::WithdrawalSuccessful {
            user: caller,
            token: token_address,
            amount: withdraw_amount
        }
    );
    spy.assert_emitted(@array![(peer_protocol_address, expected_withdraw_event)]);

    // Check transaction recorded event
    let expected_tx_event = PeerProtocol::Event::TransactionRecorded(
        PeerProtocol::TransactionRecorded {
            user: caller,
            transaction_type: TransactionType::WITHDRAWAL,
            token: token_address,
            amount: withdraw_amount,
            timestamp: withdrawal_timestamp,
            tx_hash,
        }
    );
    spy.assert_emitted(@array![(peer_protocol_address, expected_tx_event)]);

    stop_cheat_caller_address(peer_protocol_address);
}

#[test]
fn test_transaction_history() {
    let token_address = deploy_token("MockToken");
    let peer_protocol_address = deploy_peer_protocol();

    let token = IERC20Dispatcher { contract_address: token_address };
    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };

    let owner: ContractAddress = starknet::contract_address_const::<0x123626789>();
    let caller: ContractAddress = starknet::contract_address_const::<0x122226789>();
    
    let mint_amount: u256 = 1000 * ONE_E18;
    let deposit_amount: u256 = 100 * ONE_E18;
    let withdraw_amount: u256 = 50 * ONE_E18;
    
    // Add token support
    start_cheat_caller_address(peer_protocol_address, owner);
    peer_protocol.add_supported_token(token_address);
    stop_cheat_caller_address(peer_protocol_address);
    
    // Setup initial timestamp
    let initial_timestamp: u64 = 1000;
    set_block_timestamp(initial_timestamp);
    
    // Mint and approve tokens
    token.mint(caller, mint_amount);
    start_cheat_caller_address(token_address, caller);
    token.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token_address);
    
    // Perform deposit
    start_cheat_caller_address(peer_protocol_address, caller);
    peer_protocol.deposit(token_address, deposit_amount);
    let deposit_tx_hash = get_tx_hash();
    
    // Set new timestamp for withdrawal
    let withdrawal_timestamp: u64 = initial_timestamp + 3600;
    set_block_timestamp(withdrawal_timestamp);
    
    // Perform withdrawal
    peer_protocol.withdraw(token_address, withdraw_amount);
    let withdrawal_tx_hash = get_tx_hash();
    
    // Get and verify transaction history
    let history = peer_protocol.get_transaction_history(caller);
    assert!(history.len() == 2, 'Should have 2 transactions');
    
    // Verify first transaction (deposit)
    let first_tx = history.at(0);
    assert!(first_tx.transaction_type == TransactionType::DEPOSIT, 'First should be deposit');
    assert!(first_tx.token == token_address, 'Wrong token address');
    assert!(first_tx.amount == deposit_amount, 'Wrong deposit amount');
    assert!(first_tx.timestamp == initial_timestamp, 'Wrong timestamp');
    assert!(first_tx.tx_hash == deposit_tx_hash, 'Wrong transaction hash');
    
    // Verify second transaction (withdrawal)
    let second_tx = history.at(1);
    assert!(second_tx.transaction_type == TransactionType::WITHDRAWAL, 'Second should be withdrawal');
    assert!(second_tx.token == token_address, 'Wrong token address');
    assert!(second_tx.amount == withdraw_amount, 'Wrong withdrawal amount');
    assert!(second_tx.timestamp == withdrawal_timestamp, 'Wrong timestamp');
    assert!(second_tx.tx_hash == withdrawal_tx_hash, 'Wrong transaction hash');
    
    stop_cheat_caller_address(peer_protocol_address);
}

#[test]
fn test_empty_history() {
    let peer_protocol_address = deploy_peer_protocol();
    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };
    let user: ContractAddress = starknet::contract_address_const::<0x122226789>();
    
    let history = peer_protocol.get_transaction_history(user);
    assert!(history.len() == 0, 'Should have no transactions');
}