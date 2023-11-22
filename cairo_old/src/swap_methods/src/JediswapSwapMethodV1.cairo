#[abi]
trait IPair {
    fn get_reserves() -> (u256, u256, u64);
    fn swap(
        amount0Out: u256, amount1Out: u256, to: starknet::ContractAddress, data: Array::<felt252>
    );
}

#[abi]
trait IERC20 {
    fn transfer(recipient: starknet::ContractAddress, amount: u256) -> bool;
}

#[abi]
trait IRouter {
    fn get_amount_out(amountIn: u256, reserveIn: u256, reserveOut: u256) -> u256;
}

#[contract]
mod JediswapSwapMethodV1 {
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
            contract_address: contract_address_const::<
                0x041fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023
            >()
        };

        let (reserve0, reserve1, _) = pair.get_reserves();

        token_in.transfer(pair_address, amount_in);

        let mut amount_out = 0;
        let data = ArrayTrait::<felt252>::new();
        if zero_for_one == 1 {
            amount_out = router.get_amount_out(amount_in, reserve0, reserve1);
            pair.swap(0, amount_out, contract, data);
        } else if zero_for_one == 0 {
            amount_out = router.get_amount_out(amount_in, reserve1, reserve0);
            pair.swap(amount_out, 0, contract, data);
        } else {
            assert(false, 'unknown swap direction')
        }

        amount_out
    }
}
