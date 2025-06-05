const {tasks} = require('hardhat/config');

task("interact-contract", "interact with FundMe contract")
    .addParam("addr", "fundme contract address")
    .setAction(async (taskArgs, hre) => {
        const fundMeFactory = await ethers.getContractFactory("FundMe");
        const fundMe = fundMeFactory.attach(taskArgs.addr);
        // init 2 accounts
        const [firstAccount, secondAccount] = await ethers.getSigners();
        // fund contract with first account
        const fundTx =  await fundMe.fund({value: ethers.parseEther("0.5")})
        await fundTx.wait();
        // check balance of contract
        const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
        console.log(`Balance of contract after first funding: ${ethers.formatEther(balanceOfContract)} ETH`);
        // fund contract with second account
        const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({value: ethers.parseEther("0.5")})
        await fundTxWithSecondAccount.wait();
        // check balance of contract
        const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target);
        console.log(`Balance of contract after first funding: ${ethers.formatEther(balanceOfContractAfterSecondFund)} ETH`);
        // check mapping fundersToAmount
        const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address);
        const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address);
        console.log(`First account balance in FundMe: ${ethers.formatEther(firstAccountBalanceInFundMe)} ETH`);
        console.log(`Second account balance in FundMe: ${ethers.formatEther(secondAccountBalanceInFundMe)} ETH`);
});

module.exports = {};