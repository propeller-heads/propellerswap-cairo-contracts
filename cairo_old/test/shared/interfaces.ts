export abstract class Interfaces {
    public static ERC20_ABI = [
        {
            "name": "Uint256",
            "size": 2,
            "type": "struct",
            "members": [
                {
                    "name": "low",
                    "type": "felt",
                    "offset": 0
                },
                {
                    "name": "high",
                    "type": "felt",
                    "offset": 1
                }
            ]
        },
        {
            "data": [
                {
                    "name": "from_",
                    "type": "felt"
                },
                {
                    "name": "to",
                    "type": "felt"
                },
                {
                    "name": "value",
                    "type": "Uint256"
                }
            ],
            "keys": [],
            "name": "Transfer",
            "type": "event"
        },
        {
            "data": [
                {
                    "name": "owner",
                    "type": "felt"
                },
                {
                    "name": "spender",
                    "type": "felt"
                },
                {
                    "name": "value",
                    "type": "Uint256"
                }
            ],
            "keys": [],
            "name": "Approval",
            "type": "event"
        },
        {
            "name": "name",
            "type": "function",
            "inputs": [],
            "outputs": [
                {
                    "name": "name",
                    "type": "felt"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "symbol",
            "type": "function",
            "inputs": [],
            "outputs": [
                {
                    "name": "symbol",
                    "type": "felt"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "totalSupply",
            "type": "function",
            "inputs": [],
            "outputs": [
                {
                    "name": "totalSupply",
                    "type": "Uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "decimals",
            "type": "function",
            "inputs": [],
            "outputs": [
                {
                    "name": "decimals",
                    "type": "felt"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "balanceOf",
            "type": "function",
            "inputs": [
                {
                    "name": "account",
                    "type": "felt"
                }
            ],
            "outputs": [
                {
                    "name": "balance",
                    "type": "Uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "allowance",
            "type": "function",
            "inputs": [
                {
                    "name": "owner",
                    "type": "felt"
                },
                {
                    "name": "spender",
                    "type": "felt"
                }
            ],
            "outputs": [
                {
                    "name": "remaining",
                    "type": "Uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "permittedMinter",
            "type": "function",
            "inputs": [],
            "outputs": [
                {
                    "name": "minter",
                    "type": "felt"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "initialized",
            "type": "function",
            "inputs": [],
            "outputs": [
                {
                    "name": "res",
                    "type": "felt"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "get_version",
            "type": "function",
            "inputs": [],
            "outputs": [
                {
                    "name": "version",
                    "type": "felt"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "get_identity",
            "type": "function",
            "inputs": [],
            "outputs": [
                {
                    "name": "identity",
                    "type": "felt"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "initialize",
            "type": "function",
            "inputs": [
                {
                    "name": "init_vector_len",
                    "type": "felt"
                },
                {
                    "name": "init_vector",
                    "type": "felt*"
                }
            ],
            "outputs": []
        },
        {
            "name": "transfer",
            "type": "function",
            "inputs": [
                {
                    "name": "recipient",
                    "type": "felt"
                },
                {
                    "name": "amount",
                    "type": "Uint256"
                }
            ],
            "outputs": [
                {
                    "name": "success",
                    "type": "felt"
                }
            ]
        },
        {
            "name": "transferFrom",
            "type": "function",
            "inputs": [
                {
                    "name": "sender",
                    "type": "felt"
                },
                {
                    "name": "recipient",
                    "type": "felt"
                },
                {
                    "name": "amount",
                    "type": "Uint256"
                }
            ],
            "outputs": [
                {
                    "name": "success",
                    "type": "felt"
                }
            ]
        },
        {
            "name": "approve",
            "type": "function",
            "inputs": [
                {
                    "name": "spender",
                    "type": "felt"
                },
                {
                    "name": "amount",
                    "type": "Uint256"
                }
            ],
            "outputs": [
                {
                    "name": "success",
                    "type": "felt"
                }
            ]
        },
        {
            "name": "increaseAllowance",
            "type": "function",
            "inputs": [
                {
                    "name": "spender",
                    "type": "felt"
                },
                {
                    "name": "added_value",
                    "type": "Uint256"
                }
            ],
            "outputs": [
                {
                    "name": "success",
                    "type": "felt"
                }
            ]
        },
        {
            "name": "decreaseAllowance",
            "type": "function",
            "inputs": [
                {
                    "name": "spender",
                    "type": "felt"
                },
                {
                    "name": "subtracted_value",
                    "type": "Uint256"
                }
            ],
            "outputs": [
                {
                    "name": "success",
                    "type": "felt"
                }
            ]
        },
        {
            "name": "permissionedMint",
            "type": "function",
            "inputs": [
                {
                    "name": "recipient",
                    "type": "felt"
                },
                {
                    "name": "amount",
                    "type": "Uint256"
                }
            ],
            "outputs": []
        },
        {
            "name": "permissionedBurn",
            "type": "function",
            "inputs": [
                {
                    "name": "account",
                    "type": "felt"
                },
                {
                    "name": "amount",
                    "type": "Uint256"
                }
            ],
            "outputs": []
        }
    ]
    public static JEDISWAP_ROUTER_ABI = [
        {
            "name": "Uint256",
            "size": 2,
            "type": "struct",
            "members": [
                {
                    "name": "low",
                    "type": "felt",
                    "offset": 0
                },
                {
                    "name": "high",
                    "type": "felt",
                    "offset": 1
                }
            ]
        },
        {
            "data": [
                {
                    "name": "implementation",
                    "type": "felt"
                }
            ],
            "keys": [],
            "name": "Upgraded",
            "type": "event"
        },
        {
            "data": [
                {
                    "name": "previousAdmin",
                    "type": "felt"
                },
                {
                    "name": "newAdmin",
                    "type": "felt"
                }
            ],
            "keys": [],
            "name": "AdminChanged",
            "type": "event"
        },
        {
            "name": "initializer",
            "type": "function",
            "inputs": [
                {
                    "name": "factory",
                    "type": "felt"
                },
                {
                    "name": "proxy_admin",
                    "type": "felt"
                }
            ],
            "outputs": []
        },
        {
            "name": "factory",
            "type": "function",
            "inputs": [],
            "outputs": [
                {
                    "name": "address",
                    "type": "felt"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "sort_tokens",
            "type": "function",
            "inputs": [
                {
                    "name": "tokenA",
                    "type": "felt"
                },
                {
                    "name": "tokenB",
                    "type": "felt"
                }
            ],
            "outputs": [
                {
                    "name": "token0",
                    "type": "felt"
                },
                {
                    "name": "token1",
                    "type": "felt"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "quote",
            "type": "function",
            "inputs": [
                {
                    "name": "amountA",
                    "type": "Uint256"
                },
                {
                    "name": "reserveA",
                    "type": "Uint256"
                },
                {
                    "name": "reserveB",
                    "type": "Uint256"
                }
            ],
            "outputs": [
                {
                    "name": "amountB",
                    "type": "Uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "get_amount_out",
            "type": "function",
            "inputs": [
                {
                    "name": "amountIn",
                    "type": "Uint256"
                },
                {
                    "name": "reserveIn",
                    "type": "Uint256"
                },
                {
                    "name": "reserveOut",
                    "type": "Uint256"
                }
            ],
            "outputs": [
                {
                    "name": "amountOut",
                    "type": "Uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "get_amount_in",
            "type": "function",
            "inputs": [
                {
                    "name": "amountOut",
                    "type": "Uint256"
                },
                {
                    "name": "reserveIn",
                    "type": "Uint256"
                },
                {
                    "name": "reserveOut",
                    "type": "Uint256"
                }
            ],
            "outputs": [
                {
                    "name": "amountIn",
                    "type": "Uint256"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "get_amounts_out",
            "type": "function",
            "inputs": [
                {
                    "name": "amountIn",
                    "type": "Uint256"
                },
                {
                    "name": "path_len",
                    "type": "felt"
                },
                {
                    "name": "path",
                    "type": "felt*"
                }
            ],
            "outputs": [
                {
                    "name": "amounts_len",
                    "type": "felt"
                },
                {
                    "name": "amounts",
                    "type": "Uint256*"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "get_amounts_in",
            "type": "function",
            "inputs": [
                {
                    "name": "amountOut",
                    "type": "Uint256"
                },
                {
                    "name": "path_len",
                    "type": "felt"
                },
                {
                    "name": "path",
                    "type": "felt*"
                }
            ],
            "outputs": [
                {
                    "name": "amounts_len",
                    "type": "felt"
                },
                {
                    "name": "amounts",
                    "type": "Uint256*"
                }
            ],
            "stateMutability": "view"
        },
        {
            "name": "add_liquidity",
            "type": "function",
            "inputs": [
                {
                    "name": "tokenA",
                    "type": "felt"
                },
                {
                    "name": "tokenB",
                    "type": "felt"
                },
                {
                    "name": "amountADesired",
                    "type": "Uint256"
                },
                {
                    "name": "amountBDesired",
                    "type": "Uint256"
                },
                {
                    "name": "amountAMin",
                    "type": "Uint256"
                },
                {
                    "name": "amountBMin",
                    "type": "Uint256"
                },
                {
                    "name": "to",
                    "type": "felt"
                },
                {
                    "name": "deadline",
                    "type": "felt"
                }
            ],
            "outputs": [
                {
                    "name": "amountA",
                    "type": "Uint256"
                },
                {
                    "name": "amountB",
                    "type": "Uint256"
                },
                {
                    "name": "liquidity",
                    "type": "Uint256"
                }
            ]
        },
        {
            "name": "remove_liquidity",
            "type": "function",
            "inputs": [
                {
                    "name": "tokenA",
                    "type": "felt"
                },
                {
                    "name": "tokenB",
                    "type": "felt"
                },
                {
                    "name": "liquidity",
                    "type": "Uint256"
                },
                {
                    "name": "amountAMin",
                    "type": "Uint256"
                },
                {
                    "name": "amountBMin",
                    "type": "Uint256"
                },
                {
                    "name": "to",
                    "type": "felt"
                },
                {
                    "name": "deadline",
                    "type": "felt"
                }
            ],
            "outputs": [
                {
                    "name": "amountA",
                    "type": "Uint256"
                },
                {
                    "name": "amountB",
                    "type": "Uint256"
                }
            ]
        },
        {
            "name": "swap_exact_tokens_for_tokens",
            "type": "function",
            "inputs": [
                {
                    "name": "amountIn",
                    "type": "Uint256"
                },
                {
                    "name": "amountOutMin",
                    "type": "Uint256"
                },
                {
                    "name": "path_len",
                    "type": "felt"
                },
                {
                    "name": "path",
                    "type": "felt*"
                },
                {
                    "name": "to",
                    "type": "felt"
                },
                {
                    "name": "deadline",
                    "type": "felt"
                }
            ],
            "outputs": [
                {
                    "name": "amounts_len",
                    "type": "felt"
                },
                {
                    "name": "amounts",
                    "type": "Uint256*"
                }
            ]
        },
        {
            "name": "swap_tokens_for_exact_tokens",
            "type": "function",
            "inputs": [
                {
                    "name": "amountOut",
                    "type": "Uint256"
                },
                {
                    "name": "amountInMax",
                    "type": "Uint256"
                },
                {
                    "name": "path_len",
                    "type": "felt"
                },
                {
                    "name": "path",
                    "type": "felt*"
                },
                {
                    "name": "to",
                    "type": "felt"
                },
                {
                    "name": "deadline",
                    "type": "felt"
                }
            ],
            "outputs": [
                {
                    "name": "amounts_len",
                    "type": "felt"
                },
                {
                    "name": "amounts",
                    "type": "Uint256*"
                }
            ]
        }
    ]
}