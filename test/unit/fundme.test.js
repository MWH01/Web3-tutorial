const { ethers, deployments, getNamedAccounts} = require("hardhat");
const { assert, expect } = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { DEVELOPMENT_CHAINS } = require("../../helper-hardhat-config");

DEVELOPMENT_CHAINS.includes(network.name) ? 
describe("test fundme contract", async function () {
    let fundMe
    let userAccount
    let deployer
    let user
    beforeEach(async function() {
        await deployments.fixture(["Mocks", "FundMe"])
        deployer = (await getNamedAccounts()).deployer
        user = (await getNamedAccounts()).user
        const fundMeDeployment = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
        // 这里拼写修正，并且用user signer连接合约
        userAccount = fundMe.connect(await ethers.getSigner(user));
    })

    it("test if the owner is msg.sender", async function () {
        // const [deployer] = await ethers.getSigners()
        // const fundMeFactory = await ethers.getContractFactory("FundMe")
        // const fundMe = await fundMeFactory.deploy(180)
        // await fundMe.waitForDeployment()
        assert.equal((await fundMe.owner()), deployer)
    })

    it("test if the datafeed is assigned correctly", async function () {
        // const fundMeFactory = await ethers.getContractFactory("FundMe")
        // const fundMe = await fundMeFactory.deploy(180)
        // await fundMe.waitForDeployment()
        // assert.equal(await fundMe.dataFeed(), "0x694AA1769357215DE4FAC081bf1f309aDC325306")
        const mock = await deployments.get("MockV3Aggregator")
        assert.equal(await fundMe.dataFeed(), mock.address)
    })

    it("should reject fund() with zero ETH", async function () {
        await expect(fundMe.fund({ value: 0 }))
        .to.be.revertedWith("Send more ETH")
    })

    // fund, getFund, refund
    // unit test for fund
    // windows open, value greater than the mi nimum value, funder balance
    it("window closed, value greater than the minimum value, funder failed", async function () {
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        // value is greater than the minimum value
        await expect(fundMe.fund({ value: ethers.parseEther("0.1") }))
        .to.be.revertedWith("window is closed")
    })

    it("window open, value is less than the minimum value, funder failed", async function () {
        // value is less than the minimum value
        await expect(fundMe.fund({ value: ethers.parseEther("0.0001") }))
        .to.be.revertedWith("Send more ETH")
    })

    it("window open, value is greater than the minimum value, funder success", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        const balance = await fundMe.fundersToAmount(deployer);
        expect(balance).to.equal(ethers.parseEther("0.1"));
    })

    // unit test for getFund
    // onlyOwner, windowClosed, targetReached
    it("not owner, window closed, target reached, getFund failed", async function () {
        // make sure the target is reached
        await fundMe.fund({ value: ethers.parseEther("1") });
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        // not owner
        await expect(userAccount.getFund())
        .to.be.revertedWith("this function can only be called by owner")
    })

    it("window open, target reached, getFund failed", async function () {
        // make sure the target is reached
        await fundMe.fund({ value: ethers.parseEther("1") });
        // window is open
        await expect(fundMe.getFund())
        .to.be.revertedWith("window is not closed")
    })

    it("window closed, target not reached, getFund failed", async function () {
        // make sure the target is not reached
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        // target not reached
        await expect(fundMe.getFund())
        .to.be.revertedWith("target is not reached")
    })

    it("window closed, target reached, getFund success", async function () {
        // make sure the target is reached
        await fundMe.fund({ value: ethers.parseEther("1") });
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        // owner can get fund
        await expect(fundMe.getFund())
            .to.emit(fundMe, "FundWithdrawByOwner")
            .withArgs(ethers.parseEther("1"))
    })  

    // refund
    // windowClosed, target not reached, funder has balance
    it("window open, target not reached, funder has balance, refund failed", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        await expect(fundMe.refund()).to.be.revertedWith("window is not closed")
    })

    it("window closed, target reached, funder has balance, refund failed", async function () {
        // make sure the target is reached
        await fundMe.fund({ value: ethers.parseEther("1") });
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        // target reached
        await expect(fundMe.refund()).to.be.revertedWith("target is reached")
    })

    it("window closed, target not reached, funder has not balance, refund failed", async function () {
        // make sure the target is reached
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        // target reached
        await expect(userAccount.refund()).to.be.revertedWith("there is no fund for you")
    })

    it("window closed, target not reached, funder has balance, refund success", async function () {
        // make sure the target is not reached
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        // make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        // funder can refund
        await expect(fundMe.refund())
            .to.emit(fundMe, "RefundByFunder")
            .withArgs(deployer, ethers.parseEther("0.1"))
    })
}) : describe.skip