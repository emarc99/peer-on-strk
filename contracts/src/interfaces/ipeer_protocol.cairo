use starknet::ContractAddress;
use peer_protocol::peer_protocol::PeerProtocol::UserDeposit;

#[starknet::interface]
pub trait IPeerProtocol<TContractState> {
    fn deposit(ref self: TContractState, token_address: ContractAddress, amount: u256);
    fn add_supported_token(ref self: TContractState, token_address: ContractAddress);
    fn withdraw(ref self: TContractState, token_address: ContractAddress, amount: u256);
    fn get_user_deposits(self: @TContractState, user: ContractAddress) -> Span<UserDeposit>;
}