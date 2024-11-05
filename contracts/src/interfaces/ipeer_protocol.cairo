use starknet::ContractAddress;
use peer_protocol::{Transaction, UserAssets, UserDeposit};
use core::array::ArrayTrait;
use core::span::Span;

#[starknet::interface]
pub trait IPeerProtocol<TContractState> {
    fn deposit(ref self: TContractState, token_address: ContractAddress, amount: u256);
    fn add_supported_token(ref self: TContractState, token_address: ContractAddress);
    fn withdraw(ref self: TContractState, token_address: ContractAddress, amount: u256);
    fn get_transaction_history(self: @TContractState, user: ContractAddress) -> Array<Transaction>;
    fn get_user_assets(self: @TContractState, user: ContractAddress) -> Array<UserAssets>;
    fn get_user_deposits(self: @TContractState, user: ContractAddress) -> Span<UserDeposit>;
}