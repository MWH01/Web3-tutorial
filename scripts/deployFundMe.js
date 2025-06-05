// import ethers;
// create main function
    // init 2 accounts
    // fund contract with first account
    // check balance of contract
    // fund contract with second account
    // check balance of contract
    // check mapping fundersToAmount
// execute main function

const {ethers} = require("hardhat");

async function main() {
    // create factory for the FundMe contract
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    console.log("Deploying FundMe contract...");
    // deploy the contract
    const fundMe = await fundMeFactory.deploy(300);
    await fundMe.waitForDeployment();
    console.log(`FundMe contract deployed at: ${await fundMe.target}`);
    
    // verify the contract on Etherscan 
    if(hre.network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("waited for 5 blocks to confirm the deployment");
        await fundMe.deploymentTransaction().wait(5);
        await verifyFundMe(fundMe.target, [300]);
    } else {
        console.log("Skipping contract verification on Etherscan");
    }

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
}

async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: [300],
    });
}


main().then().catch((error) => {
    console.error("Error deploying FundMe contract:", error);
    process.exit(1);
});
// This script deploys the FundMe contract using Hardhat and ethers.js.
// It creates a contract factory for the FundMe contract, deploys it, and logs the address of the deployed contract.
// Make sure to run this script with the command: npx hardhat run scripts/deployFundMe.js --network <network_name>  