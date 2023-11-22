import { ETH_ADDRESS, ETH_USDC_10KSWAP } from "./shared/constants";
import { ETH, USDC, executor, tenKSwapFixtures } from "./shared/fixtures";
import { CallData, Contract, uint256 } from "starknet";
import { expect } from "chai";

// IMPORTANT 🚨:  Launch starknet-devnet before running this test. Refer to README for instructions

describe("TenKSwapMethodV1", () => {
    let TenKSwapMethodV1: Contract;
    let balanceBefore: any;
    let USDCBalanceBefore: any;

    const getETHBalance = async (address) => Number(uint256.uint256ToBN((await ETH.balanceOf(address))["balance"]));
    const getUSDCBalance = async (address) => Number(uint256.uint256ToBN((await USDC.balanceOf(address))["balance"]));


    before(async () => {
        TenKSwapMethodV1 = await tenKSwapFixtures();
        TenKSwapMethodV1.connect(executor);
        balanceBefore = await getETHBalance(TenKSwapMethodV1.address);
        USDCBalanceBefore = await getUSDCBalance(TenKSwapMethodV1.address);
        console.log(`Balances before swap: ${balanceBefore} ETH, ${USDCBalanceBefore} USDC`);
    });

    it("Should swap 1 ETH for USDC", async () => {
        const calldata = CallData.compile({
            amount_in: { low: 1e18.toString(), high: "0" },
            data: [ETH_ADDRESS, ETH_USDC_10KSWAP, "1"]
        });
        await TenKSwapMethodV1.swap(calldata, { parseRequest: false, parseResponse: false, });

        const balanceAfter = await getETHBalance(TenKSwapMethodV1.address);
        const USDCBalanceAfter = await getUSDCBalance(TenKSwapMethodV1.address);

        console.log(`Balances after swap: ${balanceAfter} ETH, ${USDCBalanceAfter} USDC`);
        expect(balanceAfter).to.be.lessThan(balanceBefore);
        expect(USDCBalanceBefore).to.be.lessThan(USDCBalanceAfter);
    });

});