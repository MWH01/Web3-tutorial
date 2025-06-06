//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// FundMe
// 1. 让 FundMe 的参与者通过 mapping 来领取相对应数量的通证
// 2. 让 FundMe 的参与者可以 transfer 通证
// 3. 在使用完成之后，需要 burn 通证

import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import {FundMe} from './FundMe.sol';

contract FundTokenERC20 is ERC20 {
    FundMe fundMe;
    constructor(address fundMeAddr) ERC20("Fund token", "FT") {
        fundMe = FundMe(fundMeAddr);
    }

    function mint(uint256 amountToMint) public {
        require(fundMe.fundersToAmount(msg.sender) >= amountToMint, "not enough funders to mint token");
        require(fundMe.getFundSuccess(), "The fundMe is not completed yet");//getter
         _mint(msg.sender, amountToMint);
         // 不是无限铸造
         fundMe.setFunderToAmount(msg.sender, fundMe.fundersToAmount(msg.sender) - amountToMint);
    }

    function claim(uint256 amountToClaim) public {
        // complete claim
        require(balanceOf(msg.sender) >= amountToClaim, "You don't have enough ERC20 tokens");
        require(fundMe.getFundSuccess(), "The fundMe is not completed yet");//getter
        /*to add*/
        // burn amountToClaim Tokens
        _burn(msg.sender, amountToClaim);
    }
}