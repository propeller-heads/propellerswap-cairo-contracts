import { Account, Provider } from "starknet";

// Initialize the wallet.
const executorPrivateKey = process.env.DEFIBOT_EXECUTOR_ACCOUNT!;
const executorAddress = process.env.DEFIBOT_EXECUTOR_ADDRESS!;

const provider = new Provider({
  sequencer: { baseUrl: "https://alpha-mainnet.starknet.io" },
});
const executor = new Account(provider, executorAddress, executorPrivateKey);

const swapRouter = "";
const calldata = ``;

async function main() {
  const calldataArr = calldata.split(",");
  console.log(calldataArr);

  //Need to approve before
  const multiCall = await executor.execute([
    {
      contractAddress: swapRouter,
      entrypoint: "swap",
      calldata: calldataArr,
    },
  ]);
  console.log("✅ Transaction sent: ", multiCall.transaction_hash);
  await provider.waitForTransaction(multiCall.transaction_hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
