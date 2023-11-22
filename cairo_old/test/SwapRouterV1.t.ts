import { ETH_ADDRESS, ETH_USDC_10KSWAP, ETH_USDC_JEDISWAP, EXECUTOR_ADDRESS, USDC_ADDRESS, WBTC_ADDRESS, WBTC_USDC_10KSWAP } from "./shared/constants";
import { DAI, ETH, USDC, WBTC, anon, deployer, executor, swapRouterFixtures } from "./shared/fixtures";
import { CallData, Contract, GatewayError, uint256 } from "starknet";
import { expect } from "chai";
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);


// IMPORTANT 🚨:  Launch starknet-devnet before running this test. Refer to README for instructions

describe("SwapRouterV1", () => {
    let SwapRouterV1: Contract;
    let balanceBefore: any;
    let USDCBalanceBefore: any;
    let WBTCBalanceBefore: any;
    let DAIBalanceBefore: any;

    const getETHBalance = async (address: string) => Number(uint256.uint256ToBN((await ETH.balanceOf(address))["balance"]));
    const getUSDCBalance = async (address: string) => Number(uint256.uint256ToBN((await USDC.balanceOf(address))["balance"]));
    const getWBTCBalance = async (address: string) => Number(uint256.uint256ToBN((await WBTC.balanceOf(address))["balance"]));
    const getDAIBalance = async (address: string) => Number(uint256.uint256ToBN((await DAI.balanceOf(address))["balance"]));


    before(async () => {
        SwapRouterV1 = await swapRouterFixtures();
        SwapRouterV1.connect(executor);
        balanceBefore = await getETHBalance(EXECUTOR_ADDRESS);
        USDCBalanceBefore = await getUSDCBalance(EXECUTOR_ADDRESS);
        WBTCBalanceBefore = await getWBTCBalance(EXECUTOR_ADDRESS);
        DAIBalanceBefore = await getDAIBalance(EXECUTOR_ADDRESS);
        console.log(`Balances before swap: ${balanceBefore} ETH, ${USDCBalanceBefore} USDC, ${WBTCBalanceBefore} WBTC, ${DAIBalanceBefore} DAI`);
    });

    it("Test with solver calldata", async () => {
        const calldata = `0x9,
        0x8,0x0,0x3,0x2e147a,0x1,0x2,0x17e9e62c04b50800d7c59454754fe31a2193c9c3c6c92c093f2ab0faadf8c87,0x0,
        0x9,0x0,0x1,0x666666,0x1,0x2,0x4d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a,0x1,
        0x9,0x0,0x3,0x0,0x1,0x2,0x7e2a13b40fc1119ec55e0bcf9428eedaa581ab3c924561ad4e955f95da63138,0x0,
        0x8,0x1,0x2,0x7ae14,0x1,0x2,0x41a708cf109737a50baa6cbeb9adf0bf8d97112dc6cc80c7a458cbad35328b0,0x1,
        0x9,0x1,0x2,0x451eb8,0x1,0x2,0x5801bdad32f343035fb242e98d1e9371ae85bc1543962fedea16c59b35bd19b,0x1,
        0x8,0x1,0x3,0x47ae14,0x1,0x2,0x2e767b996c8d4594c73317bb102c2018b9036aee8eed08ace5f45b3568b94e5,0x0,
        0x9,0x1,0x3,0x0,0x1,0x2,0xcfd39f5244f7b617418c018204a8a9f9a7f72e71f0ef38f968eeb2a9ca302b,0x0,
        0x8,0x2,0x3,0x333332,0x1,0x2,0x41d52e15e82b003bf0ad52ca58393c87abef3e00f1bf69682fd4162d5773f8f,0x0,
        0x9,0x2,0x3,0x0,0x1,0x2,0xf0f5b3eed258344152e1f17baf84a2e1b621cd754b625bec169e8595aea767,0x0,
        0x4,
        0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7,
        0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8,
        0x68f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8,
        0xda114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3,
        0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79,
        0x8ac7230489e80000,0x0,
        0x0,0x0`; //This is amount out min, it's set to 0 because prices might changes in the future
        const calldataArr = calldata.split(",")
        await executor.execute(
            [
                // Transfer in token
                {
                    contractAddress: ETH.address,
                    entrypoint: "transfer",
                    calldata: CallData.compile({ recipient: SwapRouterV1.address, amount: { low: 1e18.toString(), high: "0" } })
                },
                // Set swap methods
                {
                    contractAddress: SwapRouterV1.address,
                    entrypoint: "swap",
                    calldata: calldataArr
                }
            ],
        )

        const balanceAfter = await getETHBalance(EXECUTOR_ADDRESS);
        const USDCBalanceAfter = await getUSDCBalance(EXECUTOR_ADDRESS);
        const WBTCBalanceAfter = await getWBTCBalance(EXECUTOR_ADDRESS);
        const DAIBalanceAfter = await getDAIBalance(EXECUTOR_ADDRESS);
        console.log(`Balances after swap: ${balanceAfter} ETH, ${USDCBalanceAfter} USDC, ${WBTCBalanceAfter} WBTC, ${DAIBalanceAfter} DAI`);
        expect(balanceAfter).to.be.lessThan(balanceBefore);
        expect(USDCBalanceAfter).to.be.equal(Number(0));
        expect(WBTCBalanceAfter).to.be.equal(Number(0));
        expect(DAIBalanceBefore).to.be.lessThan(DAIBalanceAfter);
    });

    it("Should swap 1 ETH for USDC on Jediswap then USDC for WBTC on 10kswap", async () => {
        const calldata = CallData.compile({
            swaps: [
                { exchange: 9, token_in_index: 0, token_out_index: 1, split_percentage: 0, token_inclusion: 1, protocol_data: [ETH_USDC_JEDISWAP, "1"] },
                { exchange: 8, token_in_index: 1, token_out_index: 2, split_percentage: 0, token_inclusion: 1, protocol_data: [WBTC_USDC_10KSWAP, "0"] },
            ],
            tokens: [ETH_ADDRESS, USDC_ADDRESS, WBTC_ADDRESS],
            receiver: EXECUTOR_ADDRESS,
            amount_in: { low: 1e18.toString(), high: "0" },
            amount_out_min: { low: "0", high: "0" },
        });

        await executor.execute(
            [
                // Transfer in token
                {
                    contractAddress: ETH.address,
                    entrypoint: "transfer",
                    calldata: CallData.compile({ recipient: SwapRouterV1.address, amount: { low: 1e18.toString(), high: "0" } })
                },
                // Set swap methods
                {
                    contractAddress: SwapRouterV1.address,
                    entrypoint: "swap",
                    calldata: calldata
                }
            ],
        )


        const balanceAfter = await getETHBalance(EXECUTOR_ADDRESS);
        const USDCBalanceAfter = await getUSDCBalance(EXECUTOR_ADDRESS);
        const WBTCBalanceAfter = await getWBTCBalance(EXECUTOR_ADDRESS);
        console.log(`Balances after swap: ${balanceAfter} ETH, ${USDCBalanceAfter} USDC, ${WBTCBalanceAfter} WBTC`);
        expect(balanceAfter).to.be.lessThan(balanceBefore);
        expect(WBTCBalanceBefore).to.be.lessThan(WBTCBalanceAfter);
        expect(USDCBalanceAfter).to.be.equal(Number(0));
    });

    it("Should split swap 1 ETH: 0.6 for USDC on Jediswap and 0.4 for USDC on 10kswap", async () => {
        const calldata = CallData.compile({
            swaps: [
                { exchange: 9, token_in_index: 0, token_out_index: 1, split_percentage: 10066329, token_inclusion: 1, protocol_data: [ETH_USDC_JEDISWAP, "1"] },
                { exchange: 8, token_in_index: 0, token_out_index: 1, split_percentage: 0, token_inclusion: 1, protocol_data: [ETH_USDC_10KSWAP, "1"] },
            ],
            tokens: [ETH_ADDRESS, USDC_ADDRESS],
            receiver: EXECUTOR_ADDRESS,
            amount_in: { low: 1e18.toString(), high: "0" },
            amount_out_min: { low: "0", high: "0" },
        });

        await executor.execute(
            [
                // Transfer in token
                {
                    contractAddress: ETH.address,
                    entrypoint: "transfer",
                    calldata: CallData.compile({ recipient: SwapRouterV1.address, amount: { low: 1e18.toString(), high: "0" } })
                },
                // Set swap methods
                {
                    contractAddress: SwapRouterV1.address,
                    entrypoint: "swap",
                    calldata: calldata
                }
            ],
        )

        const balanceAfter = await getETHBalance(EXECUTOR_ADDRESS);
        const USDCBalanceAfter = await getUSDCBalance(EXECUTOR_ADDRESS);
        console.log(`Balances after split swap: ${balanceAfter} ETH, ${USDCBalanceAfter} USDC`);
        expect(balanceAfter).to.be.lessThan(balanceBefore);
        expect(USDCBalanceBefore).to.be.lessThan(USDCBalanceAfter);
    });

    it("Should fail to reinitialize", async () => {
        SwapRouterV1.connect(deployer);
        let error: any;

        try {
            await SwapRouterV1.initialize({ parseRequest: false, parseResponse: false, });
        } catch (e) {
            error = e;
        }

        expect(error).to.be.instanceOf(GatewayError);
        expect(error.message).to.contain("Execution was reverted; failure reason: [0x436f6e747261637420616c726561647920696e697469616c697a6564]");
    });

    it("Should fail only executor assertion", async () => {
        let error: any;
        SwapRouterV1.connect(anon);
        const calldata = CallData.compile({
            swaps: [
                { exchange: 9, token_in_index: 0, token_out_index: 1, split_percentage: 0, token_inclusion: 1, protocol_data: [ETH_USDC_JEDISWAP, "1"] },
                { exchange: 8, token_in_index: 1, token_out_index: 2, split_percentage: 0, token_inclusion: 1, protocol_data: [WBTC_USDC_10KSWAP, "0"] },
            ],
            tokens: [ETH_ADDRESS, USDC_ADDRESS, WBTC_ADDRESS],
            receiver: EXECUTOR_ADDRESS,
            amount_in: { low: 1e18.toString(), high: "0" },
            amount_out_min: { low: "0", high: "0" },
        });

        try {
            await SwapRouterV1.swap(calldata, { parseRequest: false, parseResponse: false, });
        } catch (e) {
            error = e;
        }

        expect(error).to.be.instanceOf(GatewayError);
        expect(error.message).to.contain("Execution was reverted; failure reason: [0x63616c6c6572206973206d697373696e6720726f6c65]");
    });

    it("Should fail only admin assertion", async () => {
        SwapRouterV1.connect(anon);
        let error: any;
        const calldata = CallData.compile({
            tokens: [USDC_ADDRESS]
        });

        try {
            await SwapRouterV1.withdraw(calldata, { parseRequest: false, parseResponse: false });
        } catch (e) {
            error = e;
        }

        expect(error).to.be.instanceOf(GatewayError);
        expect(error.message).to.contain("Execution was reverted; failure reason: [0x63616c6c6572206973206d697373696e6720726f6c65]");
    });

    it("Should withdraw fund from contract", async () => {
        ETH.connect(deployer);
        await ETH.transfer(SwapRouterV1.address, { low: 100e18.toString(), high: "0" });
        SwapRouterV1.connect(deployer);
        balanceBefore = await getETHBalance(SwapRouterV1.address);
        const calldata = CallData.compile({
            tokens: [ETH_ADDRESS]
        });

        await SwapRouterV1.withdraw(calldata, { parseRequest: false, parseResponse: false, });

        const balanceAfter = await getETHBalance(SwapRouterV1.address);
        expect(balanceAfter).to.be.lessThan(balanceBefore);
        expect(balanceAfter).to.be.equal(Number(0));
    });
});