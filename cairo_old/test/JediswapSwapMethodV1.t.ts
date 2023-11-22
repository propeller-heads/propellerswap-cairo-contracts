import { ETH_ADDRESS, ETH_USDC_JEDISWAP } from "./shared/constants";
import { ETH, USDC, executor, jediSwapFixtures } from "./shared/fixtures";
import { CallData, Contract, uint256 } from "starknet";
import { expect } from "chai";

// IMPORTANT 🚨:  Launch starknet-devnet before running this test. Refer to README for instructions

describe("JediswapSwapMethodV1", () => {
    let JediswapSwapMethodV1: Contract;
    let balanceBefore: any;
    let USDCBalanceBefore: any;

    const getETHBalance = async (address: string) => Number(uint256.uint256ToBN((await ETH.balanceOf(address))["balance"]));
    const getUSDCBalance = async (address: string) => Number(uint256.uint256ToBN((await USDC.balanceOf(address))["balance"]));


    before(async () => {
        JediswapSwapMethodV1 = await jediSwapFixtures();
        JediswapSwapMethodV1.connect(executor);
        balanceBefore = await getETHBalance(JediswapSwapMethodV1.address);
        USDCBalanceBefore = await getUSDCBalance(JediswapSwapMethodV1.address);
        console.log(`Balances before swap: ${balanceBefore} ETH, ${USDCBalanceBefore} USDC`);
    });

    it("Should swap 1 ETH for USDC", async () => {
        const calldata = CallData.compile({
            amount_in: { low: 1e18.toString(), high: "0" },
            data: [ETH_ADDRESS, ETH_USDC_JEDISWAP, "1"]
        });
        await JediswapSwapMethodV1.swap(calldata, { parseRequest: false, parseResponse: false, });

        const balanceAfter = await getETHBalance(JediswapSwapMethodV1.address);
        const USDCBalanceAfter = await getUSDCBalance(JediswapSwapMethodV1.address);

        console.log(`Balances after swap: ${balanceAfter} ETH, ${USDCBalanceAfter} USDC`);
        expect(balanceAfter).to.be.lessThan(balanceBefore);
        expect(USDCBalanceBefore).to.be.lessThan(USDCBalanceAfter);
    });
});