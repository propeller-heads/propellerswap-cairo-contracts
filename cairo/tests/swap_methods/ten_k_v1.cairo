use starknet::{ContractAddress, contract_address_const, Felt252TryIntoContractAddress};

use snforge_std::{declare, ContractClassTrait, BlockId, start_prank};
use super::super::constants::{USDT_ADDRESS, USDC_ADDRESS, ETH_ADDRESS, ETH_USDC_10KSWAP};
use super::super::traits::{Felt252IntoERC20, ContractIntoERC20};
use super::utils::{deploy_contract, deal_ETH};

use defibot_cairo::interfaces::IERC20::IERC20Dispatcher;
use defibot_cairo::interfaces::IERC20::IERC20DispatcherTrait;
use defibot_cairo::swap_methods::interface::ISwapMethodDispatcher;
use defibot_cairo::swap_methods::interface::ISwapMethodDispatcherTrait;

use debug::PrintTrait;

fn setup() -> (ContractAddress, ISwapMethodDispatcher) {
    let ten_k_address = deploy_contract('TenKSwapMethodV1');
    let ten_k = ISwapMethodDispatcher { contract_address: ten_k_address };
    (ten_k_address, ten_k)
}

#[test]
#[fork("FORK_BLOCK_416850")]
fn test_swap_ETH_USDC() {
    // Setup
    let (ten_k_address, ten_k) = setup();
    let amount_in = 10_000000000000000000; // 10 ETH
    let USDC: IERC20Dispatcher = USDC_ADDRESS.into();

    let mut calldata_arr = ArrayTrait::<felt252>::new();
    calldata_arr.append(ETH_ADDRESS); // token in
    calldata_arr.append(ETH_USDC_10KSWAP); // target pool
    calldata_arr.append(1); // zero to one

    // Logic
    deal_ETH(ten_k_address, amount_in);

    ten_k.swap(amount_in, calldata_arr);

    // Assertion
    let balance_after_swap = USDC.balanceOf(ten_k_address);
    assert(balance_after_swap == 19961_246632, 'Error');
}
