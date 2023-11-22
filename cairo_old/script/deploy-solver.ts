import { Account, Contract, DeclareContractResponse, Provider, json, CallData } from "starknet";
import fs from "fs";

// Initialize the wallet.
const deployerPrivateKey = process.env.DEFIBOT_DEPLOYMENT_ACCOUNT!;
const deployerAddress = process.env.DEFIBOT_DEPLOYMENT_ADDRESS!;
const executorAddress = process.env.DEFIBOT_EXECUTOR_ADDRESS!;

const provider = new Provider({ sequencer: { baseUrl: "https://alpha-mainnet.starknet.io" } });
const deployer = new Account(provider, deployerAddress, deployerPrivateKey);

async function declareJediswapSwapMethodV1(): Promise<[DeclareContractResponse, any]> {
    // Declare & deploy contract
    const compiledSierra = json.parse(fs.readFileSync("./src/swap_methods/target/dev/swap_methods_JediswapSwapMethodV1.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./src/swap_methods/target/dev/swap_methods_JediswapSwapMethodV1.casm.json").toString("ascii"));
    const declareResponse = await deployer.declare({ contract: compiledSierra, casm: compiledCasm });
    return [declareResponse, compiledSierra.abi];
}

async function declare10kSwapMethodV1(): Promise<[DeclareContractResponse, any]> {
    // Declare & deploy contract
    const compiledSierra = json.parse(fs.readFileSync("./src/swap_methods/target/dev/swap_methods_TenKSwapMethodV1.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./src/swap_methods/target/dev/swap_methods_TenKSwapMethodV1.casm.json").toString("ascii"));
    const declareResponse = await deployer.declare({ contract: compiledSierra, casm: compiledCasm });
    return [declareResponse, compiledSierra.abi];
}

async function deploySwapRouterV1(): Promise<Contract> {
    // Declare & deploy contract
    const compiledSierra = json.parse(fs.readFileSync("./src/swap_router/target/dev/swap_router_SwapRouterV1.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./src/swap_router/target/dev/swap_router_SwapRouterV1.casm.json").toString("ascii"));
    const deployResponse = await deployer.declare({ contract: compiledSierra, casm: compiledCasm });
    const contractClassHash = deployResponse.class_hash;
    console.log('✅ SwapRouterV1 declared at:', deployResponse.class_hash);
    await provider.waitForTransaction(deployResponse.transaction_hash);
    const { transaction_hash: transaction_hash, address } = await deployer.deployContract({ classHash: contractClassHash, salt: "0" });
    await provider.waitForTransaction(transaction_hash);

    // Return the new contract instance
    const contract = new Contract(compiledSierra.abi, address, provider);
    return contract;
}

async function main(): Promise<Contract> {
    //TODO: nonce is not updated between calls. Need to investigate why and fix that. New devtools might be better for deploying (Protostar maybe?).
    const SwapRouterV1 = await deploySwapRouterV1();
    SwapRouterV1.connect(deployer);
    console.log('✅ SwapRouterV1 Contract deployed at:', SwapRouterV1.address);

    const [jediswapDeclareResponse,] = await declareJediswapSwapMethodV1();
    console.log('✅ JediswapSwapMethodV1 declared at:', jediswapDeclareResponse.class_hash);
    const [tenKSwapDeclareResponse,] = await declare10kSwapMethodV1();
    console.log('✅ TenKSwapMethodV1 declared at:', tenKSwapDeclareResponse.class_hash);


    const multiCall = await deployer.execute(
        [
            // Initialize the contract
            {
                contractAddress: SwapRouterV1.address,
                entrypoint: "initialize",
                calldata: CallData.compile({})
            },
            // Give executor role
            {
                contractAddress: SwapRouterV1.address,
                entrypoint: "grant_role",
                calldata: CallData.compile({
                    role: "0x4558454355544f52",
                    account: executorAddress
                })
            },
            // Set swap methods
            {
                contractAddress: SwapRouterV1.address,
                entrypoint: "set_swap_method_batch",
                calldata: CallData.compile({
                    methods: [{ id: "9", method: jediswapDeclareResponse.class_hash }, { id: "8", method: tenKSwapDeclareResponse.class_hash }],
                })
            }
        ],
    )
    const setupTx = await provider.waitForTransaction(multiCall.transaction_hash);
    console.log('✅ Router setup at', setupTx.transaction_hash);

    return (SwapRouterV1);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });