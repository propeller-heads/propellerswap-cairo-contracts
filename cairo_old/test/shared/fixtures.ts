import {
  Account,
  Contract,
  DeclareContractResponse,
  Provider,
  json,
  CallData,
  uint256,
} from "starknet";
import {
  DEPLOYER_PRIVATE_KEY,
  DEPLOYER_ADDRESS,
  ETH_ADDRESS,
  USDC_ADDRESS,
  JEDISWAP_ROUTER_ADDRESS,
  EXECUTOR_ADDRESS,
  EXECUTOR_PRIVATE_KEY,
  WBTC_ADDRESS,
  USDT_ADDRESS,
  ANON_ADDRESS,
  ANON_PRIVATE_KEY,
  DAI_ADDRESS,
} from "./constants";
import fs from "fs";
import { Interfaces } from "./interfaces";

export const provider = new Provider({
  sequencer: { baseUrl: "http://127.0.0.1:5050" },
});
export const deployer = new Account(
  provider,
  DEPLOYER_ADDRESS,
  DEPLOYER_PRIVATE_KEY
);
export const executor = new Account(
  provider,
  EXECUTOR_ADDRESS,
  EXECUTOR_PRIVATE_KEY
);
export const anon = new Account(provider, ANON_ADDRESS, ANON_PRIVATE_KEY);
export const ETH = new Contract(Interfaces.ERC20_ABI, ETH_ADDRESS, provider);
export const USDC = new Contract(Interfaces.ERC20_ABI, USDC_ADDRESS, provider);
export const WBTC = new Contract(Interfaces.ERC20_ABI, WBTC_ADDRESS, provider);
export const USDT = new Contract(Interfaces.ERC20_ABI, USDT_ADDRESS, provider);
export const DAI = new Contract(Interfaces.ERC20_ABI, DAI_ADDRESS, provider);
export const JediswapRouter = new Contract(
  Interfaces.JEDISWAP_ROUTER_ABI,
  JEDISWAP_ROUTER_ADDRESS,
  provider
);

export async function declareJediswapSwapMethodV1(): Promise<
  [DeclareContractResponse, any]
> {
  // Declare & deploy contract
  const compiledSierra = json.parse(
    fs
      .readFileSync(
        "./src/swap_methods/target/dev/swap_methods_JediswapSwapMethodV1.sierra.json"
      )
      .toString("ascii")
  );
  const compiledCasm = json.parse(
    fs
      .readFileSync(
        "./src/swap_methods/target/dev/swap_methods_JediswapSwapMethodV1.casm.json"
      )
      .toString("ascii")
  );
  const declareResponse = await deployer.declare({
    contract: compiledSierra,
    casm: compiledCasm,
  });
  return [declareResponse, compiledSierra.abi];
}

export async function deployJediswapSwapMethodV1(): Promise<Contract> {
  // Declare & deploy contract
  const [declareResponse, abi] = await declareJediswapSwapMethodV1();
  const contractClassHash = declareResponse.class_hash;
  await provider.waitForTransaction(declareResponse.transaction_hash);
  const { transaction_hash: transaction_hash, address } =
    await deployer.deployContract({ classHash: contractClassHash, salt: "0" });
  await provider.waitForTransaction(transaction_hash);

  // Return the new contract instance
  const contract = new Contract(abi, address, provider);
  return contract;
}

export async function declare10kSwapMethodV1(): Promise<
  [DeclareContractResponse, any]
> {
  // Declare & deploy contract
  const compiledSierra = json.parse(
    fs
      .readFileSync(
        "./src/swap_methods/target/dev/swap_methods_TenKSwapMethodV1.sierra.json"
      )
      .toString("ascii")
  );
  const compiledCasm = json.parse(
    fs
      .readFileSync(
        "./src/swap_methods/target/dev/swap_methods_TenKSwapMethodV1.casm.json"
      )
      .toString("ascii")
  );
  const declareResponse = await deployer.declare({
    contract: compiledSierra,
    casm: compiledCasm,
  });
  return [declareResponse, compiledSierra.abi];
}

export async function deploy10kSwapMethodV1(): Promise<Contract> {
  // Declare & deploy contract
  const [declareResponse, abi] = await declare10kSwapMethodV1();
  const contractClassHash = declareResponse.class_hash;
  await provider.waitForTransaction(declareResponse.transaction_hash);
  const { transaction_hash: transaction_hash, address } =
    await deployer.deployContract({ classHash: contractClassHash, salt: "0" });
  await provider.waitForTransaction(transaction_hash);

  // Return the new contract instance
  const contract = new Contract(abi, address, provider);
  return contract;
}

export async function deploySwapRouterV1(): Promise<Contract> {
  // Declare & deploy contract
  const compiledSierra = json.parse(
    fs
      .readFileSync(
        "./src/swap_router/target/dev/swap_router_SwapRouterV1.sierra.json"
      )
      .toString("ascii")
  );
  const compiledCasm = json.parse(
    fs
      .readFileSync(
        "./src/swap_router/target/dev/swap_router_SwapRouterV1.casm.json"
      )
      .toString("ascii")
  );
  const deployResponse = await deployer.declare({
    contract: compiledSierra,
    casm: compiledCasm,
  });
  const contractClassHash = deployResponse.class_hash;
  console.log("✅ SwapRouterV1 declared at:", deployResponse.class_hash);
  await provider.waitForTransaction(deployResponse.transaction_hash);
  const { transaction_hash: transaction_hash, address } =
    await deployer.deployContract({ classHash: contractClassHash, salt: "0" });
  await provider.waitForTransaction(transaction_hash);

  // Return the new contract instance
  const contract = new Contract(compiledSierra.abi, address, provider);
  return contract;
}

export async function deployFrontendSwapRouterV1(): Promise<Contract> {
  // Declare & deploy contract
  const compiledSierra = json.parse(
    fs
      .readFileSync(
        "./src/swap_router/target/dev/swap_router_FrontendSwapRouterV1.sierra.json"
      )
      .toString("ascii")
  );
  const compiledCasm = json.parse(
    fs
      .readFileSync(
        "./src/swap_router/target/dev/swap_router_FrontendSwapRouterV1.casm.json"
      )
      .toString("ascii")
  );
  const deployResponse = await deployer.declare({
    contract: compiledSierra,
    casm: compiledCasm,
  });
  const contractClassHash = deployResponse.class_hash;
  console.log(
    "✅ FrontendSwapRouterV1 declared at:",
    deployResponse.class_hash
  );
  await provider.waitForTransaction(deployResponse.transaction_hash);
  const { transaction_hash: transaction_hash, address } =
    await deployer.deployContract({ classHash: contractClassHash, salt: "0" });
  await provider.waitForTransaction(transaction_hash);

  // Return the new contract instance
  const contract = new Contract(compiledSierra.abi, address, provider);
  return contract;
}

export async function getSwapRouter(): Promise<Contract> {
  const compiledSierra = json.parse(
    fs
      .readFileSync(
        "./src/swap_router/target/dev/swap_router_SwapRouterV1.sierra.json"
      )
      .toString("ascii")
  );

  // Return the new contract instance
  const contract = new Contract(compiledSierra.abi, "", provider);
  ETH.connect(executor);
  await ETH.approve(contract.address, { low: (100e18).toString(), high: "0" });
  return contract;
}

export async function fundAddress(account: string, token: string) {
  ETH.connect(deployer);
  await ETH.approve(JEDISWAP_ROUTER_ADDRESS, {
    low: (10000e18).toString(),
    high: "0",
  });
  JediswapRouter.connect(deployer);
  await JediswapRouter.swap_exact_tokens_for_tokens(
    { low: (100e18).toString(), high: "0" },
    { low: "1", high: "0" },
    [ETH_ADDRESS, token],
    account,
    (1e20).toString()
  );
}

export async function giveETH(account: string) {
  ETH.connect(deployer);
  await ETH.transfer(account, { low: (100e18).toString(), high: "0" });
}

export async function jediSwapFixtures(): Promise<Contract> {
  const JediswapSwapMethodV1 = await deployJediswapSwapMethodV1();
  console.log(
    "✅ JediswapSwapMethodV1 Contract deployed at:",
    JediswapSwapMethodV1.address
  );
  await giveETH(JediswapSwapMethodV1.address);

  return JediswapSwapMethodV1;
}

export async function tenKSwapFixtures(): Promise<Contract> {
  const TenKSwapMethodV1 = await deploy10kSwapMethodV1();
  console.log(
    "✅ TenKSwapMethodV1 Contract deployed at:",
    TenKSwapMethodV1.address
  );
  await giveETH(TenKSwapMethodV1.address);

  return TenKSwapMethodV1;
}

export async function swapRouterFixtures(): Promise<Contract> {
  const SwapRouterV1 = await deploySwapRouterV1();
  SwapRouterV1.connect(deployer);
  console.log("✅ SwapRouterV1 Contract deployed at:", SwapRouterV1.address);

  const initialize = await SwapRouterV1.initialize({
    parseRequest: false,
    parseResponse: false,
  });
  console.log("✅ SwapRouterV1 initialized at:", initialize.transaction_hash);

  const [jediswapDeclareResponse] = await declareJediswapSwapMethodV1();
  console.log(
    "✅ JediswapSwapMethodV1 declared at:",
    jediswapDeclareResponse.class_hash
  );
  const [tenKSwapDeclareResponse] = await declare10kSwapMethodV1();
  console.log(
    "✅ TenKSwapMethodV1 declared at:",
    tenKSwapDeclareResponse.class_hash
  );
  let calldata = CallData.compile({
    methods: [
      { id: "9", method: jediswapDeclareResponse.class_hash },
      { id: "8", method: tenKSwapDeclareResponse.class_hash },
    ],
  });
  const setSwapMethod = await SwapRouterV1.set_swap_method_batch(calldata, {
    parseRequest: false,
    parseResponse: false,
  });
  console.log("✅ Swap methods set at:", setSwapMethod.transaction_hash);

  calldata = CallData.compile({
    role: "0x4558454355544f52",
    account: executor.address,
  });
  const giveExecutorRole = await SwapRouterV1.grant_role(calldata, {
    parseRequest: false,
    parseResponse: false,
  });
  console.log("✅ Executor set at:", giveExecutorRole.transaction_hash);

  ETH.connect(executor);
  await ETH.approve(SwapRouterV1.address, {
    low: (100e18).toString(),
    high: "0",
  });

  return SwapRouterV1;
}

export async function frontendSwapRouterFixtures(): Promise<Contract> {
  const frontendSwapRouterV1 = await deployFrontendSwapRouterV1();
  frontendSwapRouterV1.connect(deployer);
  console.log(
    "✅ Frontend SwapRouterV1 Contract deployed at:",
    frontendSwapRouterV1.address
  );

  const initialize = await frontendSwapRouterV1.initialize({
    parseRequest: false,
    parseResponse: false,
  });
  console.log(
    "✅ Frontend SwapRouterV1 initialized at:",
    initialize.transaction_hash
  );

  const [jediswapDeclareResponse] = await declareJediswapSwapMethodV1();
  console.log(
    "✅ JediswapSwapMethodV1 declared at:",
    jediswapDeclareResponse.class_hash
  );
  const [tenKSwapDeclareResponse] = await declare10kSwapMethodV1();
  console.log(
    "✅ TenKSwapMethodV1 declared at:",
    tenKSwapDeclareResponse.class_hash
  );
  let calldata = CallData.compile({
    methods: [
      { id: "9", method: jediswapDeclareResponse.class_hash },
      { id: "8", method: tenKSwapDeclareResponse.class_hash },
    ],
  });
  const setSwapMethod = await frontendSwapRouterV1.set_swap_method_batch(
    calldata,
    { parseRequest: false, parseResponse: false }
  );
  console.log("✅ Swap methods set at:", setSwapMethod.transaction_hash);

  ETH.connect(executor);
  await ETH.approve(frontendSwapRouterV1.address, {
    low: (100e18).toString(),
    high: "0",
  });

  return frontendSwapRouterV1;
}
