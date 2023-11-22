#[abi]
trait IPair {
    fn getReserves() -> (felt252, felt252, felt252);
    fn swap(amount0Out: u256, amount1Out: u256, to: starknet::ContractAddress);
}

#[abi]
trait IERC20 {
    fn transfer(recipient: starknet::ContractAddress, amount: u256) -> bool;
}

#[abi]
trait IRouter {
    fn getAmountOut(amountIn: u256, reserveIn: felt252, reserveOut: felt252) -> u256;
}

#[contract]
mod TenKSwapMethodV1 {
    use super::IPairDispatcher;
    use super::IPairDispatcherTrait;
    use super::IERC20Dispatcher;
    use super::IERC20DispatcherTrait;
    use super::IRouterDispatcher;
    use super::IRouterDispatcherTrait;
    use starknet::contract_address_const;
    use starknet::get_contract_address;
    use starknet::contract_address_try_from_felt252;
    use option::OptionTrait;

    //data = [token_in_address, target_pair_address, zero_for_one] all in felt252
    #[external]
    fn swap(amount_in: u256, data: Array::<felt252>) -> u256 {
        let contract = get_contract_address();

        let token_in_address = contract_address_try_from_felt252(*data[0]).unwrap();
        let pair_address = contract_address_try_from_felt252(*data[1]).unwrap();
        let zero_for_one = *data[2];
        let token_in = IERC20Dispatcher { contract_address: token_in_address };
        let pair = IPairDispatcher { contract_address: pair_address };
        let router = IRouterDispatcher {
            contract_address: contract_address_const::<0x07a6f98c03379b9513ca84cca1373ff452a7462a3b61598f0af5bb27ad7f76d1>()
        };

        let (reserve0, reserve1, _) = pair.getReserves();

        token_in.transfer(pair_address, amount_in);

        let mut amount_out = 0;
        if zero_for_one == 1 {
            amount_out = router.getAmountOut(amount_in, reserve0, reserve1);
            pair.swap(0, amount_out, contract);
        } else if zero_for_one == 0 {
            amount_out = router.getAmountOut(amount_in, reserve1, reserve0);
            pair.swap(amount_out, 0, contract);
        } else {
            assert(false, 'unknown direction')
        }

        amount_out
    }
}
