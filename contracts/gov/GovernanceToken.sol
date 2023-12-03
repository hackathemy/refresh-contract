// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
  constructor() ERC20("GovernanceToken", "GT") ERC20Permit("GovernanceToken") {
    // _mint(msg.sender, s_maxSupply);
  }

  // The functions below are overrides required by solidity
  function _afterTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override(ERC20Votes) {
    super._afterTokenTransfer(from, to, amount);
  }

  function _mint(address to, uint256 amount) internal override(ERC20Votes) {
    super._mint(to, amount);
  }
}

// 펀딩 버튼을 눌렀을 떄
