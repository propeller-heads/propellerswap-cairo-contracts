import {
  Account,
  Contract,
  DeclareContractResponse,
  Provider,
  json,
  CallData,
} from "starknet";
import fs from "fs";

// Initialize the wallet.
const deployerPrivateKey = process.env.DEFIBOT_DEPLOYMENT_ACCOUNT!;
const deployerAddress = process.env.DEFIBOT_DEPLOYMENT_ADDRESS!;
const executorAddress = process.env.DEFIBOT_EXECUTOR_ADDRESS!;

const provider = new Provider({
  sequencer: { baseUrl: "https://alpha-mainnet.starknet.io" },
});
const deployer = new Account(provider, deployerAddress, deployerPrivateKey);

const tenKClassHash = "";
const jediswapClassHash = "";
const swapRouterClassHash = "";

async function deploySwapRouterV1(): Promise<Contract> {
  // Declare & deploy contract
  const compiledSierra = json.parse(
    fs
      .readFileSync(
        "./src/swap_router/target/dev/swap_router_SwapRouterV1.sierra.json"
      )
      .toString("ascii")
  );
  const { transaction_hash: transaction_hash, address } =
    await deployer.deployContract({
      classHash: swapRouterClassHash,
      salt: "1",
    });
  await provider.waitForTransaction(transaction_hash);

  // Return the new contract instance
  const contract = new Contract(compiledSierra.abi, address, provider);
  return contract;
}

async function main(): Promise<Contract> {
  const SwapRouterV1 = await deploySwapRouterV1();
  SwapRouterV1.connect(deployer);
  console.log("✅ SwapRouterV1 Contract deployed at:", SwapRouterV1.address);

  const multiCall = await deployer.execute([
    // Initialize the contract
    {
      contractAddress: SwapRouterV1.address,
      entrypoint: "initialize",
      calldata: CallData.compile({}),
    },
    // Give executor role
    {
      contractAddress: SwapRouterV1.address,
      entrypoint: "grant_role",
      calldata: CallData.compile({
        role: "0x4558454355544f52",
        account: executorAddress,
      }),
    },
    // Set swap methods
    {
      contractAddress: SwapRouterV1.address,
      entrypoint: "set_swap_method_batch",
      calldata: CallData.compile({
        methods: [
          { id: "9", method: jediswapClassHash },
          { id: "8", method: tenKClassHash },
        ],
      }),
    },
  ]);
  const setupTx = await provider.waitForTransaction(multiCall.transaction_hash);
  console.log("✅ Router setup at", setupTx.transaction_hash);

  return SwapRouterV1;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
