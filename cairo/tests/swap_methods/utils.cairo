use starknet::{ContractAddress, contract_address_const};
use snforge_std::{declare, ContractClassTrait, BlockId, start_prank};
use defibot_cairo::interfaces::IERC20::IERC20Dispatcher;
use defibot_cairo::interfaces::IERC20::IERC20DispatcherTrait;

//
// UTILS
//

/// Utils function to declare and deploy a contract.
/// Returns the deployed contract address.
fn deploy_contract(name: felt252) -> ContractAddress {
    let contract = declare(name);
    contract.deploy(@ArrayTrait::new()).unwrap()
}

/// Utils function to deal ETH.
/// Args:
///    - to: address the tokens are sent to.
///    - amount: amount of ETH to give.
/// Note:
/// This functions is a hack to replace Foundry's deal() function.
/// Remove when deal is implemented in Starknet Foundry.
/// Depending on the fork block number, the ETH_whale_address might not have enough ETH.
/// In such a case, this function would fail.
/// It has around 3500 ETH available at fork "FORK_BLOCK_416850"
fn deal_ETH(to: ContractAddress, amount: u256) {
    let ETH_whale_address: ContractAddress = contract_address_const::<
        0x0179aa76deab144ef996ddda6b37f9fb259c291f7b79f4e0fca63e64228a53f5
    >();
    let ETH_address: ContractAddress = contract_address_const::<
        0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7
    >();
    let ETH = IERC20Dispatcher { contract_address: ETH_address };
    start_prank(ETH_address, ETH_whale_address);
    ETH.transfer(to, amount);
}
