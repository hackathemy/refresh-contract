// contracts/TokenReceiverContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract TokenReceiverContract {
  IERC20 public token;

  constructor(address tokenAddress) {
    // Assuming the token contract is ERC-20 compliant
    token = IERC20(tokenAddress);
  }

  function receiveTokens(uint256 amount) external {
    // Approve this contract to spend tokens on behalf of the sender
    // token.approve(address(this), amount);
    // IERC20(token).balanceOf(msg.sender);

    // Uncomment this line, and the import of "hardhat/console.sol", to print a log in your terminal
    console.log("Check Token Address is %o", token.balanceOf(msg.sender));
    console.log("Check Token Address is %o", token.balanceOf(address(this)));

    IERC20(token).approve(msg.sender, amount);

    // Transfer tokens from the sender to this contract
    IERC20(token).transferFrom(msg.sender, address(this), amount);
    console.log("Check Token Address is %o", token.balanceOf(msg.sender));
    console.log("Check Token Address is %o", token.balanceOf(address(this)));

    // Now you can use the transferred tokens within this contract as needed
    // For example, perform some logic, store the tokens, etc.
  }

  function transferToMe(address _owner, uint256 _amount) public {
    IERC20(token).transferFrom(_owner, address(this), _amount);
  }
}
