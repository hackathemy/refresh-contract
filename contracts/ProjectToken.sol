//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ProjectToken is ERC20 {
  constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    // no token minting in constructor => initial supply is 0
  }

  // you can call this function later to increase the total supply
  function mint(uint256 amount) external {
    _mint(msg.sender, amount);
  }
}
