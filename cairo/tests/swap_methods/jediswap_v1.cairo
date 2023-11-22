use starknet::{ContractAddress, contract_address_const, Felt252TryIntoContractAddress};

use snforge_std::{declare, ContractClassTrait, BlockId, start_prank};
use super::super::constants::{
    USDT_ADDRESS, USDC_ADDRESS, ETH_ADDRESS, ETH_USDC_JEDISWAP, ETH_USDT_JEDISWAP
};
use super::super::traits::{Felt252IntoERC20, ContractIntoERC20};
use super::utils::{deploy_contract, deal_ETH};

use defibot_cairo::interfaces::IERC20::IERC20Dispatcher;
use defibot_cairo::interfaces::IERC20::IERC20DispatcherTrait;
use defibot_cairo::swap_methods::interface::ISwapMethodDispatcher;
use defibot_cairo::swap_methods::interface::ISwapMethodDispatcherTrait;

fn setup() -> (ContractAddress, ISwapMethodDispatcher) {
    let jediswap_address = deploy_contract('JediswapSwapMethodV1');
    let jediswap = ISwapMethodDispatcher { contract_address: jediswap_address };
    (jediswap_address, jediswap)
}

#[test]
#[fork("FORK_BLOCK_416850")]
fn test_swap_ETH_USDC() {
    // Setup
    let (jediswap_address, jediswap) = setup();
    let amount_in = 10_000000000000000000; // 10 ETH
    let USDC: IERC20Dispatcher = USDC_ADDRESS.into();

    let mut calldata_arr = ArrayTrait::<felt252>::new();
    calldata_arr.append(ETH_ADDRESS); // token in
    calldata_arr.append(ETH_USDC_JEDISWAP); // target pool
    calldata_arr.append(1); // zero to one

    // Logic
    deal_ETH(jediswap_address, amount_in);

    jediswap.swap(amount_in, calldata_arr);

    // Assertion
    let balance_after_swap = USDC.balanceOf(jediswap_address);
    assert(balance_after_swap == 20192_796391, 'Error');
}


#[test]
#[fork("FORK_BLOCK_416850")]
fn test_swap_ETH_USDT() {
    // Setup
    let (jediswap_address, jediswap) = setup();
    let amount_in = 10_000000000000000000; // 10 ETH
    let USDT: IERC20Dispatcher = USDT_ADDRESS.into();

    let mut calldata_arr = ArrayTrait::<felt252>::new();
    calldata_arr.append(ETH_ADDRESS); // token in
    calldata_arr.append(ETH_USDT_JEDISWAP); // target pool
    calldata_arr.append(1); // zero to one

    // Logic
    deal_ETH(jediswap_address, amount_in);

    jediswap.swap(amount_in, calldata_arr);

    // Assertion
    let balance_after_swap = USDT.balanceOf(jediswap_address);
    assert(balance_after_swap == 19746_328063, 'Error');
}
