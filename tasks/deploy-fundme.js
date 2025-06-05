const { task } = require("hardhat/config");

task("deploy-fundme", "deploy and verify fundme contract").setAction(async (taskArgs, hre) => {
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
})

async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: [300],
    });
}

module.exports = {};