use starknet::{ContractAddress, get_contract_address};
use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, DeclareResult, start_cheat_caller_address,
    stop_cheat_caller_address, spy_events, EventSpyAssertionsTrait
};

use peer_protocol::interfaces::ipeer_protocol::{
    IPeerProtocolDispatcher, IPeerProtocolDispatcherTrait
};
use peer_protocol::peer_protocol::PeerProtocol;

use peer_protocol::interfaces::ierc20::{IERC20Dispatcher, IERC20DispatcherTrait};

const ONE_E18: u256 = 1000000000000000000_u256;

fn deploy_token(name: ByteArray) -> ContractAddress {
    let contract = declare("MockToken").unwrap().contract_class();

    let mut constructor_calldata = ArrayTrait::new();
    name.serialize(ref constructor_calldata);

    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();

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

    // Prank caller to deposit into peer protocol
    start_cheat_caller_address(peer_protocol_address, caller);
    let deposit_amount: u256 = 100 * ONE_E18;
    let mut spy = spy_events();

    peer_protocol.deposit(token_address, deposit_amount);

    // testing peer_protocol contract balance increase
    assert!(token.balance_of(peer_protocol_address) == deposit_amount, "deposit failed");

    // testing emitted event
    let expected_event = PeerProtocol::Event::DepositSuccessful(
        PeerProtocol::DepositSuccessful {
            user: caller, token: token_address, amount: deposit_amount
        }
    );

    spy.assert_emitted(@array![(peer_protocol_address, expected_event)]);

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

    // Mint tokens
    token.mint(caller, mint_amount);

    start_cheat_caller_address(token_address, caller);
    token.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token_address);

    start_cheat_caller_address(peer_protocol_address, caller);
    peer_protocol.deposit(token_address, deposit_amount);

    let mut spy = spy_events();
    peer_protocol.withdraw(token_address, withdraw_amount);
    assert!(
        token.balance_of(peer_protocol_address) == deposit_amount - withdraw_amount,
        "incorrect protocol balance after withdrawal"
    );
    assert!(
        token.balance_of(caller) == mint_amount - deposit_amount + withdraw_amount,
        "incorrect user balance after withdrawal"
    );
    let expected_event = PeerProtocol::Event::WithdrawalSuccessful(
        PeerProtocol::WithdrawalSuccessful {
            user: caller, token: token_address, amount: withdraw_amount
        }
    );
    spy.assert_emitted(@array![(peer_protocol_address, expected_event)]);

    stop_cheat_caller_address(peer_protocol_address);
}

#[test]
fn test_get_user_deposits() {
    // Deploy contracts
    let token1_address = deploy_token("MockToken1");
    let token2_address = deploy_token("MockToken2");
    // add another supported token without balance
    let token3_address = deploy_token("MockToken3");
    let peer_protocol_address = deploy_peer_protocol();

    // Setup dispatchers
    let token1 = IERC20Dispatcher { contract_address: token1_address };
    let token2 = IERC20Dispatcher { contract_address: token2_address };
    let peer_protocol = IPeerProtocolDispatcher { contract_address: peer_protocol_address };

    // Setup addresses
    let owner: ContractAddress = starknet::contract_address_const::<0x123626789>();
    let user: ContractAddress = starknet::contract_address_const::<0x122226789>();

    // Define amounts
    let mint_amount: u256 = 1000 * ONE_E18;
    let deposit_amount1: u256 = 100 * ONE_E18;
    let deposit_amount2: u256 = 200 * ONE_E18;

    // Add supported tokens
    start_cheat_caller_address(peer_protocol_address, owner);
    peer_protocol.add_supported_token(token1_address);
    peer_protocol.add_supported_token(token2_address);
    peer_protocol.add_supported_token(token3_address);
    stop_cheat_caller_address(peer_protocol_address);

    // Mint tokens to user
    token1.mint(user, mint_amount);
    token2.mint(user, mint_amount);

    // Approve spending
    start_cheat_caller_address(token1_address, user);
    token1.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token1_address);

    start_cheat_caller_address(token2_address, user);
    token2.approve(peer_protocol_address, mint_amount);
    stop_cheat_caller_address(token2_address);

    // Make deposits
    start_cheat_caller_address(peer_protocol_address, user);
    peer_protocol.deposit(token1_address, deposit_amount1);
    peer_protocol.deposit(token2_address, deposit_amount2);

    // Get and verify user deposits
    let user_deposits = peer_protocol.get_user_deposits(user);

    assert!(user_deposits.len() == 2, "incorrect number of deposits");

    // Verify deposit amounts for each token
    let deposit1 = user_deposits.at(0);
    let deposit2 = user_deposits.at(1);

    assert!(
        *deposit1.token == token1_address && *deposit1.amount == deposit_amount1,
        "incorrect deposit1"
    );
    assert!(
        *deposit2.token == token2_address && *deposit2.amount == deposit_amount2,
        "incorrect deposit2"
    );
    assert!(deposit1.token != deposit2.token, "duplicate tokens in result");

    stop_cheat_caller_address(peer_protocol_address);

    // Test for random user
    let random_user: ContractAddress = starknet::contract_address_const::<0x987654321>();
    let random_user_deposits = peer_protocol.get_user_deposits(random_user);
    assert!(random_user_deposits.len() == 0, "random user should have no deposits");
}
