use core::debug::PrintTrait;
use core::option::OptionTrait;
use core::traits::TryInto;
use array::ArrayTrait;
use array::SpanTrait;
use starknet::{
    ContractAddress, contract_address_const, Felt252TryIntoContractAddress, Felt252TryIntoClassHash,
};

use snforge_std::{declare, ContractClassTrait, BlockId, start_prank, stop_prank};
use super::super::constants::{
    BOB, USDT_ADDRESS, USDC_ADDRESS, ETH_ADDRESS, WBTC_ADDRESS, ETH_USDC_JEDISWAP,
    WBTC_USDC_10KSWAP, ETH_USDC_10KSWAP
};
use super::super::traits::{Felt252IntoERC20, ContractIntoERC20};
use super::utils::{deploy_contract, deal_ETH};
use serde::Serde;
use starknet::SyscallResultTrait;

use defibot_cairo::interfaces::IERC20::{IERC20Dispatcher, IERC20DispatcherTrait};
use defibot_cairo::swap_routers::swap_router_v1::interface::{
    ISwapRouterV1Dispatcher, ISwapRouterV1DispatcherTrait, IAccessControlDispatcher,
    IAccessControlDispatcherTrait
};
use defibot_cairo::swap_routers::swap_router_v1::structs::{SwapData, MethodEntry};

fn setup() -> (ContractAddress, ISwapRouterV1Dispatcher) {
    let router_address = deploy_contract('SwapRouterV1');
    let router = ISwapRouterV1Dispatcher { contract_address: router_address };
    let router_ac = IAccessControlDispatcher { contract_address: router_address };
    let jediswap = declare('JediswapSwapMethodV1');
    let ten_k_swap = declare('TenKSwapMethodV1');
    start_prank(router_address, BOB.try_into().unwrap());
    router.initialize();

    let mut methods_entries: Array<MethodEntry> = Default::default();
    let jediswap_method = MethodEntry { id: 9, method: jediswap.class_hash };
    let ten_k_method = MethodEntry { id: 8, method: ten_k_swap.class_hash };
    methods_entries.append(jediswap_method);
    methods_entries.append(ten_k_method);
    router.set_swap_method_batch(methods_entries);
    router_ac.grant_role(0x4558454355544f52, BOB.try_into().unwrap());

    stop_prank(router_address);

    (router_address, router)
}

#[test]
#[fork("FORK_BLOCK_416850")]
fn test_swap_ETH_USDC() {
    // Setup
    let (router_address, router) = setup();
    let USDC: IERC20Dispatcher = USDC_ADDRESS.into();
    let amount_in = 10_000000000000000000; // 10 ETH

    let mut data_1: Array<felt252> = Default::default();
    data_1.append(ETH_USDC_JEDISWAP); // target pool
    data_1.append(1); // zero to one

    let mut swap_data: Array<SwapData> = Default::default();
    let swap_data_1 = SwapData {
        exchange: 9,
        token_in_index: 0,
        token_out_index: 1,
        split_percentage: 0,
        token_inclusion: 1,
        protocol_data: data_1
    };
    swap_data.append(swap_data_1);

    let mut tokens: Array<ContractAddress> = Default::default();
    tokens.append(ETH_ADDRESS.try_into().unwrap());
    tokens.append(USDC_ADDRESS.try_into().unwrap());

    // Logic
    deal_ETH(router_address, amount_in);
    start_prank(router_address, BOB.try_into().unwrap());
    router.swap(swap_data, tokens, BOB.try_into().unwrap(), amount_in, 0);
    stop_prank(router_address);

    // Assertion
    let balance_after_swap = USDC.balanceOf(BOB.try_into().unwrap());
    assert(balance_after_swap == 20192_796391, 'Error');
}

#[test]
#[fork("FORK_BLOCK_416850")]
fn test_sequential_swap() {
    // Setup
    let (router_address, router) = setup();
    let WBTC: IERC20Dispatcher = WBTC_ADDRESS.into();
    let amount_in = 1_000000000000000000; // 1 ETH

    let mut data_1: Array<felt252> = Default::default();
    data_1.append(ETH_USDC_JEDISWAP); // target pool
    data_1.append(1); // zero to one

    let mut data_2: Array<felt252> = Default::default();
    data_2.append(WBTC_USDC_10KSWAP); // target pool
    data_2.append(0); // zero to one

    let mut swap_data: Array<SwapData> = Default::default();
    let swap_data_1 = SwapData {
        exchange: 9,
        token_in_index: 0,
        token_out_index: 1,
        split_percentage: 0,
        token_inclusion: 1,
        protocol_data: data_1
    };
    let swap_data_2 = SwapData {
        exchange: 8,
        token_in_index: 1,
        token_out_index: 2,
        split_percentage: 0,
        token_inclusion: 1,
        protocol_data: data_2
    };
    swap_data.append(swap_data_1);
    swap_data.append(swap_data_2);

    let mut tokens: Array<ContractAddress> = Default::default();
    tokens.append(ETH_ADDRESS.try_into().unwrap());
    tokens.append(USDC_ADDRESS.try_into().unwrap());
    tokens.append(WBTC_ADDRESS.try_into().unwrap());

    // Logic
    deal_ETH(router_address, amount_in);

    start_prank(router_address, BOB.try_into().unwrap());
    router.swap(swap_data, tokens, BOB.try_into().unwrap(), amount_in, 0);
    stop_prank(router_address);

    // Assertion
    let balance_after_swap = WBTC.balanceOf(BOB.try_into().unwrap());
    assert(balance_after_swap == 0_04519188, 'Error');
}

#[test]
#[fork("FORK_BLOCK_416850")]
fn test_split_swap() {
    // Setup
    let (router_address, router) = setup();
    let USDC: IERC20Dispatcher = USDC_ADDRESS.into();
    let amount_in = 10_000000000000000000; // 10 ETH

    let mut data_1: Array<felt252> = Default::default();
    data_1.append(ETH_USDC_JEDISWAP); // target pool
    data_1.append(1); // zero to one

    let mut data_2: Array<felt252> = Default::default();
    data_2.append(ETH_USDC_10KSWAP); // target pool
    data_2.append(1); // zero to one

    let mut swap_data: Array<SwapData> = Default::default();
    let swap_data_1 = SwapData {
        exchange: 9,
        token_in_index: 0,
        token_out_index: 1,
        split_percentage: 10066329,
        token_inclusion: 1,
        protocol_data: data_1
    };
    let swap_data_2 = SwapData {
        exchange: 8,
        token_in_index: 0,
        token_out_index: 1,
        split_percentage: 0,
        token_inclusion: 1,
        protocol_data: data_2
    };
    swap_data.append(swap_data_1);
    swap_data.append(swap_data_2);

    let mut tokens: Array<ContractAddress> = Default::default();
    tokens.append(ETH_ADDRESS.try_into().unwrap());
    tokens.append(USDC_ADDRESS.try_into().unwrap());

    // Logic
    deal_ETH(router_address, amount_in);

    start_prank(router_address, BOB.try_into().unwrap());
    router.swap(swap_data, tokens, BOB.try_into().unwrap(), amount_in, 0);
    stop_prank(router_address);

    // Assertion
    let balance_after_swap = USDC.balanceOf(BOB.try_into().unwrap());
    assert(balance_after_swap == 20207_690689, 'Error');
}

#[test]
#[should_panic(expected: ('caller is missing role',))]
fn test_unauthorized_set_swap_method() {
    // Setup
    let (router_address, router) = setup();

    // Logic
    start_prank(0xbadbabe.try_into().unwrap(), router_address);
    router.set_swap_method(100, 0x01.try_into().unwrap());
}

#[test]
#[should_panic(expected: ('caller is missing role',))]
fn test_unauthorized_set_swap_method_batch() {
    // Setup
    let (router_address, router) = setup();

    // Logic
    let mut methods_entries: Array<MethodEntry> = Default::default();
    let new_method = MethodEntry { id: 100, method: 0x01.try_into().unwrap() };
    methods_entries.append(new_method);
    start_prank(0xbadbabe.try_into().unwrap(), router_address);
    router.set_swap_method_batch(methods_entries);
}

#[test]
#[should_panic(expected: ('Contract already initialized',))]
fn test_fail_to_initialize_again() {
    // Setup
    let (router_address, router) = setup();

    // Logic
    router.initialize();
}

#[test]
#[should_panic(expected: ('caller is missing role',))]
fn test_unauthorized_swap() {
    // Setup
    let (router_address, router) = setup();

    let mut data_1: Array<felt252> = Default::default();
    let mut swap_data: Array<SwapData> = Default::default();
    let mut tokens: Array<ContractAddress> = Default::default();

    // Logic
    router.swap(swap_data, tokens, BOB.try_into().unwrap(), 0, 0);
}
