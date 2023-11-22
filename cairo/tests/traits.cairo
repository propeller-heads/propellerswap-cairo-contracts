use starknet::{ContractAddress, Felt252TryIntoContractAddress};
use defibot_cairo::interfaces::IERC20::IERC20Dispatcher;
use defibot_cairo::interfaces::IERC20::IERC20DispatcherTrait;

impl Felt252IntoERC20 of Into<felt252, IERC20Dispatcher> {
    fn into(self: felt252) -> IERC20Dispatcher {
        let token_address: ContractAddress = self.try_into().unwrap();
        IERC20Dispatcher { contract_address: token_address }
    }
}

impl ContractIntoERC20 of Into<ContractAddress, IERC20Dispatcher> {
    fn into(self: ContractAddress) -> IERC20Dispatcher {
        IERC20Dispatcher { contract_address: self }
    }
}
