//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProjectToken is ERC20Votes, Ownable {
  constructor(
    string memory name,
    string memory symbol
  ) ERC20(name, symbol) ERC20Permit(name) {
    // Set the deployer (contract creator) as the owner
    transferOwnership(msg.sender);

    // no token minting in constructor => initial supply is 0
  }

  // Function to mint new tokens, can only be called by the owner
  function mint(address account, uint256 amount) external onlyOwner {
    _mint(account, amount);
  }

  // Revert function for non-owner mint attempts
  receive() external payable {
    revert("Only the owner can mint");
  }
}
