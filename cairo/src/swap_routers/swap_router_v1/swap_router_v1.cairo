#[starknet::contract]
mod SwapRouterV1 {
    use array::ArrayTrait;
    use array::SpanTrait;
    use dict::Felt252DictTrait;
    use defibot_cairo::interfaces::IERC20::IERC20Dispatcher;
    use defibot_cairo::interfaces::IERC20::IERC20DispatcherTrait;
    use defibot_cairo::swap_methods::interface::ISwapMethodLibraryDispatcher;
    use defibot_cairo::swap_methods::interface::ISwapMethodDispatcherTrait;
    use defibot_cairo::swap_routers::swap_router_v1::structs::{
        SwapData, MethodEntry, ExternalApproval
    };
    use defibot_cairo::swap_routers::swap_router_v1::interface::{ISwapRouterV1, IAccessControl};
    use starknet::{
        get_caller_address, get_contract_address, ContractAddress, ClassHash,
        contract_address_const, class_hash_const, contract_address_to_felt252
    };

    use integer::Into;
    use option::OptionTrait;
    use serde::Serde;

    #[storage]
    struct Storage {
        _swap_methods: LegacyMap::<u8, ClassHash>,
        role_admin: LegacyMap::<felt252, felt252>,
        role_member: LegacyMap::<(felt252, ContractAddress), bool>,
        DEFAULT_ADMIN_ROLE: felt252,
        DEFAULT_EXECUTOR_ROLE: felt252,
        initialized: bool
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.DEFAULT_ADMIN_ROLE.write('ADMIN');
        self.DEFAULT_EXECUTOR_ROLE.write('EXECUTOR');
        self.role_admin.write(self.DEFAULT_ADMIN_ROLE.read(), self.DEFAULT_ADMIN_ROLE.read());
        self.role_admin.write(self.DEFAULT_EXECUTOR_ROLE.read(), self.DEFAULT_ADMIN_ROLE.read());
    }

    #[abi(embed_v0)]
    impl SwapHandler of ISwapRouterV1<ContractState> {
        fn swap(
            self: @ContractState,
            swaps: Array<SwapData>,
            tokens: Array<ContractAddress>,
            receiver: ContractAddress,
            amount_in: u256,
            amount_out_min: u256
        ) -> u256 {
            // Checks if caller has permission to call this function
            self.assert_only_role(self.DEFAULT_EXECUTOR_ROLE.read());

            let caller_address = get_caller_address();
            let contract_address = get_contract_address();

            let mut n_tokens = tokens.len();

            // TODO: Cairo doesn't support u256 dict, change for it when supported
            let mut amounts: Felt252Dict<u128> = Default::default();
            amounts.insert(0, amount_in.low);

            let receiving_token = IERC20Dispatcher {
                contract_address: *tokens.at(n_tokens - 1_usize)
            };
            let mut balance_before = receiving_token.balanceOf(contract_address);

            let sending_token = IERC20Dispatcher { contract_address: *tokens.at(0_usize) };

            self._executeSwaps(swaps, amounts, tokens);

            let mut balance_after = receiving_token.balanceOf(contract_address);
            let amount_out = balance_after - balance_before;

            assert(amount_out > amount_out_min, 'Amount Too Low');
            receiving_token.transfer(receiver, amount_out);

            amount_out
        }

        fn initialize(ref self: ContractState) {
            assert(!self.initialized.read(), 'Contract already initialized');
            self.initialized.write(true);
            let caller_address = get_caller_address();
            self.role_member.write((self.DEFAULT_ADMIN_ROLE.read(), caller_address), true);
        }

        fn set_swap_method(ref self: ContractState, id: u8, target: ClassHash) {
            self.assert_only_role(self.DEFAULT_ADMIN_ROLE.read());
            self._swap_methods.write(id, target);
        }

        fn set_swap_method_batch(ref self: ContractState, mut methods: Array<MethodEntry>) {
            self.assert_only_role(self.DEFAULT_ADMIN_ROLE.read());
            loop {
                match methods.pop_front() {
                    Option::Some(v) => { self._swap_methods.write(v.id, v.method); },
                    Option::None(_) => { break (); }
                };
            }
        }

        fn set_approvals(self: @ContractState, mut approvals: Array<ExternalApproval>) {
            self.assert_only_role(self.DEFAULT_ADMIN_ROLE.read());
            loop {
                match approvals.pop_front() {
                    Option::Some(mut v) => {
                        let token = IERC20Dispatcher { contract_address: v.token };
                        loop {
                            match v.addresses.pop_front() {
                                Option::Some(address) => { token.approve(address, v.allowance); },
                                Option::None(_) => { break (); }
                            };
                        }
                    },
                    Option::None(_) => { break (); }
                };
            }
        }

        fn withdraw(self: @ContractState, mut tokens: Array<ContractAddress>) {
            self.assert_only_role(self.DEFAULT_ADMIN_ROLE.read());
            let sender = get_caller_address();
            let contract_address = get_contract_address();
            loop {
                match tokens.pop_front() {
                    Option::Some(v) => {
                        let token = IERC20Dispatcher { contract_address: v };
                        let balance = token.balanceOf(contract_address);
                        token.transfer(sender, balance);
                    },
                    Option::None(_) => { break (); }
                };
            }
        }
    }

    #[generate_trait]
    impl SwapInternalsImpl of SwapInternalsTrait {
        fn _executeSwaps(
            self: @ContractState,
            swaps: Array<SwapData>,
            mut amounts: Felt252Dict<u128>,
            tokens: Array<ContractAddress>
        ) {
            // Need to handle arrays as dict, since on Cairo you can't assign a value for an array
            // on arbitrary positions
            let mut remaining_amounts: Felt252Dict<u128> = Default::default();

            let mut amount_in = amounts.get(0);
            remaining_amounts.insert(0, amount_in);

            let mut iterator = 0_u32;

            let n_swaps = swaps.len();
            loop {
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
                    match protocol_data.pop_front() {
                        Option::Some(v) => { calldata_arr.append(*v); },
                        Option::None(_) => { break (); }
                    };
                };

                let current_amount_out = self
                    ._swap(current_amount_in, *swap.exchange, calldata_arr);

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

        fn _swap(
            self: @ContractState, amount_in: u128, exchange: u8, calldata_arr: Array::<felt252>
        ) -> u128 {
            let method = self._swap_methods.read(exchange);
            assert(method != class_hash_const::<0x0>(), 'Unknown method');

            let swap_method = ISwapMethodLibraryDispatcher { class_hash: method };

            let res = swap_method.swap(u256 { low: amount_in, high: 0_u128 }, calldata_arr);

            assert(res.low > 0_u128, 'Zero amount');

            res.low
        }
    }

    //
    //AccessControl
    //

    #[generate_trait]
    impl AccessControlInternalImpl of AccessControlInternalTrait {
        fn _grant_role(ref self: ContractState, role: felt252, account: starknet::ContractAddress) {
            let has_role = self.role_member.read((role, account));
            if (!has_role) {
                self.role_member.write((role, account), bool::True(()));
            }
        }

        fn _revoke_role(
            ref self: ContractState, role: felt252, account: starknet::ContractAddress
        ) {
            let has_role = self.role_member.read((role, account));
            if (has_role) {
                self.role_member.write((role, account), bool::False(()));
            }
        }

        fn assert_only_role(self: @ContractState, role: felt252) {
            let caller_address = get_caller_address();
            let has_role = self.has_role(role, caller_address);
            assert(has_role, 'caller is missing role');
        }
    }

    #[abi(embed_v0)]
    impl AccessControlImpl of IAccessControl<ContractState> {
        fn has_role(
            self: @ContractState, role: felt252, account: starknet::ContractAddress
        ) -> bool {
            return self.role_member.read((role, account));
        }

        fn grant_role(ref self: ContractState, role: felt252, account: starknet::ContractAddress) {
            let admin = self.role_admin.read(role);
            self.assert_only_role(admin);
            self._grant_role(role, account);
        }


        fn revoke_role(ref self: ContractState, role: felt252, account: starknet::ContractAddress) {
            let admin = self.role_admin.read(role);
            self.assert_only_role(admin);
            self._revoke_role(role, account);
        }


        fn renounce_role(ref self: ContractState, role: felt252) {
            let caller_address = get_caller_address();
            self._revoke_role(role, caller_address);
        }
    }
}
