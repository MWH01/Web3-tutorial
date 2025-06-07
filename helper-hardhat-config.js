const DECIMAL = 8
const INITIAL_ANSWER = 300000000000
const DEVELOPMENT_CHAINS = ["hardhat", "localhost"]
const LOCK_TIME = 180 // 3 minutes
const CONFIRMATIONS = 5 // 5 blocks

const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306" // Sepolia ETH/USD Data Feed
    },
    97: {
        name: "bscTestnet",
        ethUsdDataFeed: "0x0567F2323251f0Aab1s5c8dfb1967e4e3d5a2c3f8" // BSC Testnet ETH/USD Data Feed
    },
}

module.exports = {
    DECIMAL,
    INITIAL_ANSWER,
    DEVELOPMENT_CHAINS,
    networkConfig,
    LOCK_TIME,
    CONFIRMATIONS
}