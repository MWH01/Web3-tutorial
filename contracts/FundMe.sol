// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 1.创建一个收款函数
// 2.记录投资人并且查看
// 3.在锁定期内达到目标值，生产商可以提款
// 4.在锁定期内没有达到目标值，投资方可以退款

contract FundMe{
    mapping (address => uint256) public fundersToAmount;

    uint256 MINIMUM_VALUE = 100 * 10 ** 8; // USD

    AggregatorV3Interface public dataFeed;
    // 目标 1000 美元
    uint256 constant TARGET = 1000 * 10 ** 8;
    // 收款方地址（自己）
    address public owner;
    // 时间锁
    uint256 deploymentTimestamp;
    uint256 lockTime;
    // ERC20 地址
    address erc20Addr;
    bool public getFundSuccess = false;
    event FundWithdrawByOwner(uint256);
    event RefundByFunder(address, uint256);

    constructor(uint256 _lockTime, address dataFeedAddr){
        // sepolia testnet
        dataFeed = AggregatorV3Interface(dataFeedAddr/*0x694AA1769357215DE4FAC081bf1f309aDC325306*/);
        owner = msg.sender;
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund() external payable {
        require(convertEthtoUsd(msg.value) >= MINIMUM_VALUE, "Send more ETH");
        require(block.timestamp < deploymentTimestamp + lockTime, "window is closed");
        fundersToAmount[msg.sender] += msg.value;
    }

    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthtoUsd(uint256 ethAmount) internal view returns (uint256) {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        // ethPrice = 350012000000  // 即 3500.12 * 10^8
        return ethAmount * ethPrice / (10 ** 18);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        // 仅持有人可以调用
        owner = newOwner;
    }

    function getFund() external windowClosed onlyOwner{
        require(convertEthtoUsd(address(this).balance) >= TARGET, "target is not reached");
        // transfer: transfer ETH and revert if tx failed
        // payable(msg.sender).transfer(address(this).balance);
        // send: transfer ETH and revert if tx failed
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "tx failed");
        // call: transfer ETH with data return value of function and bool
        bool success;
        uint256 balance = address(this).balance;
        (success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "transfer tx failed");
        // emit event
        emit FundWithdrawByOwner(balance);
    }

    function refund() external windowClosed{
        require(convertEthtoUsd(address(this).balance) < TARGET, "target is reached");
        require(fundersToAmount[msg.sender] != 0, "there is no fund for you");
        bool success;
        uint256 refundBalance = fundersToAmount[msg.sender];
        (success, ) = payable(msg.sender).call{value: refundBalance}("");
        require(success, "transfer tx failed");
        fundersToAmount[msg.sender] = 0;
        emit RefundByFunder(msg.sender, refundBalance);
    }

    function setFunderToAmount(address funder, uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr, "you do not have permission to call this function");
        fundersToAmount[funder] = amountToUpdate;
    }

    function setErc20Addr(address _erc20Addr) public onlyOwner{
        erc20Addr = _erc20Addr;
    }

    modifier windowClosed() {
        require(block.timestamp >= deploymentTimestamp + lockTime, "window is not closed");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "this function can only be called by owner");
        _;
    }
}