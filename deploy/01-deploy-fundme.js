// function deployFunction(){
//     console.log("Deploying FundMe...");
// }

// module.exports.default = deployFunction;
const { network } = require("hardhat");
const { DEVELOPMENT_CHAINS, networkConfig, LOCK_TIME, CONFIRMATIONS } = require("../helper-hardhat-config");
module.exports = async({getNamedAccounts, deployments}) => {
    // const getNamedAccounts = await hre.getNamedAccounts();
    // const deployments = await hre.deployments;
    const { deployer } = await getNamedAccounts();
    const {deploy, get} = deployments;
    let dataFeedAddr
    let confirmations
    if(DEVELOPMENT_CHAINS.includes(network.name)){
        // 开发网络 - 使用Mock聚合器
        const mockAggregator = await get("MockV3Aggregator");
        dataFeedAddr = mockAggregator.address
        confirmations = 0
    }else{
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed
        confirmations = CONFIRMATIONS
    }
    console.log("First Account:", deployer);
    console.log("Deploying FundMe...");
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [LOCK_TIME, dataFeedAddr],
        log: true,
        waitConfirmations: confirmations, // 等待区块确认
    })

    // verify the contract on Etherscan 
    if(hre.network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCK_TIME, dataFeedAddr],
        });
    } else {
        console.log("Network is not Sepolia or Etherscan API key is not set, skipping verification.");
    }
}

module.exports.tags = ["FundMe"];