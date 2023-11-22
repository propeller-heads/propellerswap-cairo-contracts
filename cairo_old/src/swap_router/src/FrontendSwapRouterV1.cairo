#[abi]
trait IERC20 {
    fn balanceOf(account: starknet::ContractAddress) -> u256;
    fn transfer(recipient: starknet::ContractAddress, amount: u256) -> bool;
    fn transferFrom(
        sender: starknet::ContractAddress, recipient: starknet::ContractAddress, amount: u256
    ) -> bool;
    fn approve(spender: starknet::ContractAddress, amount: u256) -> bool;
}

#[abi]
trait ISwapMethod {
    fn swap(amount_in: u256, data: Array::<felt252>) -> u256;
}


#[contract]
mod FrontendSwapRouterV1 {
    use array::ArrayTrait;
    use array::SpanTrait;
    use dict::Felt252DictTrait;
    use super::IERC20Dispatcher;
    use super::IERC20DispatcherTrait;
    use super::ISwapMethodLibraryDispatcher;
    use super::ISwapMethodDispatcherTrait;
    use starknet::get_caller_address;
    use starknet::get_contract_address;
    use starknet::ContractAddress;
    use starknet::ClassHash;
    use starknet::contract_address_const;
    use starknet::class_hash_const;
    use starknet::contract_address_to_felt252;
    use integer::Into;
    use option::OptionTrait;
    use serde::Serde;

    struct Storage {
        _swap_methods: LegacyMap::<u8, ClassHash>,
        role_admin: LegacyMap::<felt252, felt252>,
        role_member: LegacyMap::<(felt252, ContractAddress), bool>,
        DEFAULT_ADMIN_ROLE: felt252,
        initialized: bool
    }

    #[constructor]
    fn constructor() {
        DEFAULT_ADMIN_ROLE::write('ADMIN');
        role_admin::write(DEFAULT_ADMIN_ROLE::read(), DEFAULT_ADMIN_ROLE::read());
    }

    #[external]
    fn initialize() {
        assert(!initialized::read(), 'Contract already initialized');
        initialized::write(true);
        let caller_address = get_caller_address();
        role_member::write((DEFAULT_ADMIN_ROLE::read(), caller_address), true);
    }

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

    #[external]
    fn swap(
        swaps: Array<SwapData>,
        tokens: Array<ContractAddress>,
        receiver: ContractAddress,
        amount_in: u256,
        amount_out_min: u256
    ) -> u256 {
        let caller_address = get_caller_address();
        let contract_address = get_contract_address();

        let mut n_tokens = tokens.len();

        // TODO: Cairo doesn't support u256 dict, change for it when supported
        let mut amounts = Felt252DictTrait::<u128>::new();
        amounts.insert(0, amount_in.low);

        let receiving_token = IERC20Dispatcher { contract_address: *tokens.at(n_tokens - 1_usize) };
        let mut balance_before = receiving_token.balanceOf(contract_address);

        let sending_token = IERC20Dispatcher { contract_address: *tokens.at(0_usize) };

        _executeSwaps(swaps, amounts, tokens);

        let mut balance_after = receiving_token.balanceOf(contract_address);
        let amount_out = balance_after - balance_before;

        assert(amount_out > amount_out_min, 'Amount Too Low');
        receiving_token.transfer(receiver, amount_out);

        amount_out
    }

    fn _executeSwaps(
        swaps: Array<SwapData>, mut amounts: Felt252Dict<u128>, tokens: Array<ContractAddress>
    ) {
        // Need to handle arrays as dict, since on Cairo you can't assign a value for an array
        // on arbitrary positions
        let mut remaining_amounts = Felt252DictTrait::<u128>::new();

        let mut amount_in = amounts.get(0);
        remaining_amounts.insert(0, amount_in);

        let mut iterator = 0_u32;

        let n_swaps = swaps.len();
        loop {
            check_gas();
            let swap = swaps.at(iterator);

            let split = *swap.split_percentage;
            let token_case = *swap.token_inclusion;
            let token_in_index = *swap.token_in_index;
            let token_out_index = *swap.token_out_index;

            let mut current_amount_in = 0;

            if (split > 0_u128) {
                current_amount_in = amounts.get(token_in_index.into()) * split / 0xffffff_u128;
            } else {
                current_amount_in = remaining_amounts.get(token_in_index.into());
            }

            let mut calldata_arr = ArrayTrait::<felt252>::new();
            if token_case == 1_u8 {
                calldata_arr.append(contract_address_to_felt252(*tokens.at(token_in_index)));
            } else if token_case == 2_u8 {
                calldata_arr.append(contract_address_to_felt252(*tokens.at(token_out_index)));
            } else if token_case == 3_u8 {
                calldata_arr.append(contract_address_to_felt252(*tokens.at(token_in_index)));
                calldata_arr.append(contract_address_to_felt252(*tokens.at(token_out_index)));
            } else {
                assert(false, 'Unknown token case')
            }

            let mut protocol_data = swap.protocol_data.span();
            loop {
                check_gas();
                match protocol_data.pop_front() {
                    Option::Some(v) => {
                        calldata_arr.append(*v);
                    },
                    Option::None(_) => {
                        break ();
                    }
                };
            };

            let current_amount_out = _swap(current_amount_in, *swap.exchange, calldata_arr);

            let mut token_out_amount = amounts.get(token_out_index.into());
            token_out_amount = token_out_amount + current_amount_out;
            amounts.insert(token_out_index.into(), token_out_amount);

            let mut token_out_amount = remaining_amounts.get(token_out_index.into());
            token_out_amount = token_out_amount + current_amount_out;
            remaining_amounts.insert(token_out_index.into(), token_out_amount);

            let mut token_in_amount = remaining_amounts.get(token_in_index.into());
            token_in_amount = token_in_amount - current_amount_in;
            remaining_amounts.insert(token_in_index.into(), token_in_amount);

            iterator = iterator + 1_u32;
            if (iterator == n_swaps) {
                break ();
            };
        }
    }

    fn _swap(amount_in: u128, exchange: u8, calldata_arr: Array::<felt252>) -> u128 {
        let method = _swap_methods::read(exchange);
        assert(method != class_hash_const::<0x0>(), 'Unknown method');

        let swap_method = ISwapMethodLibraryDispatcher { class_hash: method };

        let res = swap_method.swap(u256 { low: amount_in, high: 0_u128 }, calldata_arr);

        assert(res.low > 0_u128, 'Zero amount');

        res.low
    }

    #[external]
    fn set_swap_method(id: u8, target: ClassHash) {
        assert_only_role(DEFAULT_ADMIN_ROLE::read());
        _swap_methods::write(id, target);
    }

    #[external]
    fn set_swap_method_batch(mut methods: Array<MethodEntry>) {
        assert_only_role(DEFAULT_ADMIN_ROLE::read());
        loop {
            check_gas();
            match methods.pop_front() {
                Option::Some(v) => {
                    _swap_methods::write(v.id, v.method);
                },
                Option::None(_) => {
                    break ();
                }
            };
        }
    }

    #[external]
    fn set_approvals(mut approvals: Array<ExternalApproval>) {
        assert_only_role(DEFAULT_ADMIN_ROLE::read());
        loop {
            check_gas();
            match approvals.pop_front() {
                Option::Some(mut v) => {
                    let token = IERC20Dispatcher { contract_address: v.token };
                    loop {
                        check_gas();
                        match v.addresses.pop_front() {
                            Option::Some(address) => {
                                token.approve(address, v.allowance);
                            },
                            Option::None(_) => {
                                break ();
                            }
                        };
                    }
                },
                Option::None(_) => {
                    break ();
                }
            };
        }
    }

    #[external]
    fn withdraw(mut tokens: Array<ContractAddress>) {
        assert_only_role(DEFAULT_ADMIN_ROLE::read());
        let sender = get_caller_address();
        let contract_address = get_contract_address();
        loop {
            check_gas();
            match tokens.pop_front() {
                Option::Some(v) => {
                    let token = IERC20Dispatcher { contract_address: v };
                    let balance = token.balanceOf(contract_address);
                    token.transfer(sender, balance);
                },
                Option::None(_) => {
                    break ();
                }
            };
        }
    }

    // TODO: Remove when automatically handled by compiler.
    #[inline(always)]
    fn check_gas() {
        match gas::withdraw_gas_all(get_builtin_costs()) {
            Option::Some(_) => {},
            Option::None(_) => {
                let mut data = ArrayTrait::new();
                data.append('Out of gas');
                panic(data);
            }
        }
    }

    //
    //AccessControl
    //

    #[view]
    fn has_role(role: felt252, account: starknet::ContractAddress) -> bool {
        return role_member::read((role, account));
    }

    #[external]
    fn grant_role(role: felt252, account: starknet::ContractAddress) {
        let admin = role_admin::read(role);
        assert_only_role(admin);
        _grant_role(role, account);
    }

    fn _grant_role(role: felt252, account: starknet::ContractAddress) {
        let has_role = role_member::read((role, account));
        if (!has_role) {
            role_member::write((role, account), bool::True(()));
        }
    }

    #[external]
    fn revoke_role(role: felt252, account: starknet::ContractAddress) {
        let admin = role_admin::read(role);
        assert_only_role(admin);
        _revoke_role(role, account);
    }

    fn _revoke_role(role: felt252, account: starknet::ContractAddress) {
        let has_role = role_member::read((role, account));
        if (has_role) {
            role_member::write((role, account), bool::False(()));
        }
    }

    #[external]
    fn renounce_role(role: felt252) {
        let caller_address = get_caller_address();
        _revoke_role(role, caller_address);
    }

    fn assert_only_role(role: felt252) {
        let caller_address = get_caller_address();
        let has_role = has_role(role, caller_address);
        assert(has_role, 'caller is missing role');
    }
}
