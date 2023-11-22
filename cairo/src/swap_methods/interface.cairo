#[starknet::interface]
trait ISwapMethod<TContractState> {
    fn swap(self: @TContractState, amount_in: u256, data: Array::<felt252>) -> u256;
}
