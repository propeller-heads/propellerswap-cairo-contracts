import { Account, CallData, Provider } from "starknet";
import readline from "readline";

// Initialize the wallet.
const adminPrivateKey = process.env.DEFIBOT_DEPLOYMENT_ACCOUNT!;
const adminAddress = process.env.DEFIBOT_DEPLOYMENT_ADDRESS!;

const provider = new Provider({
  sequencer: { baseUrl: "https://alpha-mainnet.starknet.io" },
});
const admin = new Account(provider, adminAddress, adminPrivateKey);

const swapRouterAddress = "";

//Enter addresses to whitelist here:
const whitelistAddresses = [""];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  console.log(
    "You are about to give executor role to these addresses:",
    whitelistAddresses
  );

  const confirmation: string = await new Promise((resolve) => {
    rl.question("Press Y to confirm\n", (answer) => {
      resolve(answer);
    });
  });

  rl.close();

  if (confirmation.toLowerCase() !== "y") {
    console.log("Operation cancelled");
    return;
  }

  for (let a of whitelistAddresses) {
    console.log(`Whitelisting: ${a}...`);

    await executeWithRetry(admin, [
      {
        contractAddress: swapRouterAddress,
        entrypoint: "grant_role",
        calldata: CallData.compile({
          role: "0x4558454355544f52",
          account: a,
        }),
      },
    ]);
  }
}

async function executeWithRetry(
  account: Account,
  data: any,
  maxRetries: number = 10,
  delay: number = 5000
) {
  let attempt = 1;
  while (attempt <= maxRetries) {
    try {
      const result = await account.execute(data);
      console.log("✅ Transaction sent: ", result.transaction_hash);
      await provider.waitForTransaction(result.transaction_hash);
      return result;
    } catch (err) {
      console.log(
        `Attempt ${attempt} failed: ${err.message}. Retrying in ${
          delay / 1000
        } seconds...`
      );
      attempt += 1;

      // Wait for delay milliseconds before the next attempt
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Max retry attempts exceeded.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
