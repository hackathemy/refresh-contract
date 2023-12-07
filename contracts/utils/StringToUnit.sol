// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

library Utils {
  function stringToUint(string memory s) public pure returns (uint) {
    bytes memory b = bytes(s);
    uint result = 0;
    for (uint256 i = 0; i < b.length; i++) {
      uint256 c = uint256(uint8(b[i]));
      if (c >= 48 && c <= 57) {
        result = result * 10 + (c - 48);
      }
    }
    return result;
  }
}
