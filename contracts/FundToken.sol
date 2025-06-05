// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FundToken{
    // 名称
    string public tokenName;
    // 简称
    string public tokenSymbol;
    // 发行数量
    uint256 public totalSupply;
    // owner 地址
    address public owner;
    // balance （address => uint256）
    mapping(address => uint256) public balances;

    constructor(string memory _tokenName, string memory _tokenSymbol) {
        tokenName = _tokenName;
        tokenSymbol = _tokenSymbol;
        owner = msg.sender;
    }

    // mint: 获取 token
    function mint(uint256 amountToMint) public {
        balances[msg.sender] += amountToMint;
        totalSupply += amountToMint;
    }

    // transfer: transfer token
    function transfer(address payee, uint256 amount) public {
        require(balances[msg.sender] > amount, "You do not have enough balance to transfer");
        balances[msg.sender] -= amount;
        balances[payee] += amount;
    }

    // balanceOf: 查看某一个地址的token 数量
    function balanceOf(address addr) public view returns(uint256) {
        return balances[addr];
    }

}