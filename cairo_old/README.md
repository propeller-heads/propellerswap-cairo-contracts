# Getting Started
These contracts are written on version 1.1.0 of Cairo.

## Prerequisites
You will need to have Rust, Node.js and Typescript intalled to run these tests.

## Install Cairo 1 Compiler

We need to install cairo compiler to run our testnet.

Compile a Starknet Contract to a Sierra ContractClass:
```bash
git clone https://github.com/starkware-libs/cairo.git
```

## Install Scarb
````bash
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh -s -- -v 0.4.0
````
## Install Devnet

In order to test locally, we need to install [starknet-devnet](https://shard-labs.github.io/starknet-devnet/).

Create a Python 3.9 venv:
```bash
conda create --name starknet-devnet python=3.9
conda activate starknet-devnet  
```

Install starknet-devnet:
```bash
conda install starknet-devnet 
```
Run mainnet fork locally:
```bash
starknet-devnet --seed 0 --cairo-compiler-manifest path/to/cairo/folder/Cargo.toml --fork-network https://alpha-mainnet.starknet.io --timeout 1000
```

## Compile contracts

To compile a contract: 
```bash
cd cairo/src/folder_of_contract
scarb build
```

This will create the files (sierra and casm) needed to deploy and run the tests.


## Install Javascript dependencies

Install dependencies:
```bash
npm install
```

## Run tests

Run test: (it takes ~1 minute)
```bash
npm run test
```

## Formatting
We use the scarb standard for formatting Cairo contracts.

To format a contract: 
```bash
cd cairo/src/folder_of_contract
scarb fmt
```

## Run a deployment script
Set up the necessary env vars and then run
```bash
npx ts-node script/your-script.ts
```