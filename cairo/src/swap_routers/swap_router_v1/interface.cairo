use starknet::{ContractAddress, ClassHash};
use defibot_cairo::swap_routers::swap_router_v1::structs::{SwapData, ExternalApproval, MethodEntry};

#[starknet::interface]
trait ISwapRouterV1<TContractState> {
    fn swap(
        self: @TContractState,
        swaps: Array<SwapData>,
        tokens: Array<ContractAddress>,
        receiver: ContractAddress,
        amount_in: u256,
        amount_out_min: u256
    ) -> u256;
    fn initialize(ref self: TContractState);
    fn set_swap_method(ref self: TContractState, id: u8, target: ClassHash);
    fn set_swap_method_batch(ref self: TContractState, methods: Array<MethodEntry>);
    fn set_approvals(self: @TContractState, approvals: Array<ExternalApproval>);
    fn withdraw(self: @TContractState, tokens: Array<ContractAddress>);
}


#[starknet::interface]
trait IAccessControl<TContractState> {
    fn has_role(self: @TContractState, role: felt252, account: starknet::ContractAddress) -> bool;
    fn grant_role(ref self: TContractState, role: felt252, account: starknet::ContractAddress);
    fn revoke_role(ref self: TContractState, role: felt252, account: starknet::ContractAddress);
    fn renounce_role(ref self: TContractState, role: felt252);
}
