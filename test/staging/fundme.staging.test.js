const { ethers, deployments, getNamedAccounts} = require("hardhat");
const { assert, expect } = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { DEVELOPMENT_CHAINS } = require("../../helper-hardhat-config");

!DEVELOPMENT_CHAINS.includes(network.name) ? 
describe("test fundme contract", async function () {
    let fundMe
    let deployer
    beforeEach(async function() {
        await deployments.fixture(["FundMe"])
        deployer = (await getNamedAccounts()).deployer
        const fundMeDeployment = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
    })

    // test fund and getFund successfully
    it("fund and getFund successfully", async function () {
        // make sure target is reached
        await fundMe.fund({ value: ethers.parseEther("0.5") })
        // make sure the window is closed
        await new Promise(resolve => setTimeout(resolve, 181 * 1000))
        // make sure we can get receipt
        const getFundTx = await fundMe.getFund()
        const getFundReceipt = await getFundTx.wait()
        expect(getFundReceipt)
            .to.be.emit(fundMe, "FundWithdrawByOwner")
            .withArgs(ethers.parseEther("0.5"))
    })

    // test fund and refund successfully
    it("fund and refund successfully", async function () {
        // make sure target is not reached
        await fundMe.fund({ value: ethers.parseEther("0.1") })
        // make sure the window is closed
        await new Promise(resolve => setTimeout(resolve, 181 * 1000))
        // make sure we can get receipt
        const refundTx = await fundMe.refund()
        const refundReceipt = await refundTx.wait()
        expect(refundReceipt)
            .to.be.emit(fundMe, "RefundByFunder")
            .withArgs(deployer, ethers.parseEther("0.1"))
    })

}) : describe.skip