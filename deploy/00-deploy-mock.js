const { DECIMAL, INITIAL_ANSWER, DEVELOPMENT_CHAINS } = require("../helper-hardhat-config");

module.exports = async({getNamedAccounts, deployments}) => {
    // const getNamedAccounts = await hre.getNamedAccounts();
    // const deployments = await hre.deployments;
    if(DEVELOPMENT_CHAINS.includes(network.name)){
        const {firstAccount} = await getNamedAccounts();
        const {deploy} = deployments;
        console.log("Deploying Mock...");
        await deploy("MockV3Aggregator", {
            from: firstAccount,
            args: [DECIMAL, INITIAL_ANSWER],
            log: true,
        })
    } else {
        console.log("Mock deployment skipped on non-development chain.");
    }
}

module.exports.tags = ["Mock"];