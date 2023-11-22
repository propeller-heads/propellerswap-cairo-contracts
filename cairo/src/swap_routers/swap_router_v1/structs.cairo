use starknet::ClassHash;
use starknet::ContractAddress;

use serde::Serde;

#[derive(Drop, Serde)]
struct SwapData {
    exchange: u8,
    token_in_index: u32,
    token_out_index: u32,
    split_percentage: u128,
    token_inclusion: u8,
    protocol_data: Array<felt252>
}

#[derive(Drop, Serde)]
struct MethodEntry {
    id: u8,
    method: ClassHash
}

#[derive(Drop, Serde)]
struct ExternalApproval {
    token: ContractAddress,
    addresses: Array<ContractAddress>,
    allowance: u256,
}
