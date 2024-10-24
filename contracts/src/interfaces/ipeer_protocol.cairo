use starknet::ContractAddress;

#[starknet::interface]
pub trait IPeerProtocol<TContractState> {
    fn deposit(ref self: TContractState, token: ContractAddress, amount: u256);
}