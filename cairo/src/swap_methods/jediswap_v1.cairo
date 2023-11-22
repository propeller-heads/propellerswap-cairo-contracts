#[starknet::interface]
trait IPair<TContractState> {
    fn get_reserves(self: @TContractState) -> (u256, u256, u64);
    fn swap(
        ref self: TContractState,
        amount0Out: u256,
        amount1Out: u256,
        to: starknet::ContractAddress,
        data: Array::<felt252>
    );
}

#[starknet::interface]
trait IRouter<TContractState> {
    fn get_amount_out(
        self: @TContractState, amountIn: u256, reserveIn: u256, reserveOut: u256
    ) -> u256;
}

#[starknet::contract]
mod JediswapSwapMethodV1 {
    use super::IPairDispatcher;
    use super::IPairDispatcherTrait;
    use defibot_cairo::interfaces::IERC20::IERC20Dispatcher;
    use defibot_cairo::interfaces::IERC20::IERC20DispatcherTrait;
    use super::IRouterDispatcher;
    use super::IRouterDispatcherTrait;
    use starknet::contract_address_const;
    use starknet::get_contract_address;
    use starknet::contract_address_try_from_felt252;
    use option::OptionTrait;
    use defibot_cairo::swap_methods::interface::ISwapMethod;

    #[storage]
    struct Storage {}

    #[abi(embed_v0)]
    impl SwapHandler of ISwapMethod<ContractState> {
        //data = [token_in_address, target_pair_address, zero_for_one] all in felt252
        fn swap(self: @ContractState, amount_in: u256, data: Array::<felt252>) -> u256 {
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
}
