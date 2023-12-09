// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {PrimitiveTypeUtils} from "@iden3/contracts/lib/PrimitiveTypeUtils.sol";
import {ICircuitValidator} from "@iden3/contracts/interfaces/ICircuitValidator.sol";
import {ZKPVerifier} from "@iden3/contracts/verifiers/ZKPVerifier.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenTransferContract is ZKPVerifier {
  uint64 public constant TRANSFER_REQUEST_ID = 1701840378;

  IERC20 public token;
  mapping(uint256 => uint256) public idMap;

  uint64 public totalVotes = 0;
  uint256 public votesTheshhold;
  address public builder = 0xa763ebb58Fc66220F208e697E585a4197A941c84;
  event TokensTransferred(
    address indexed from,
    address indexed to,
    uint256 amount
  );

  constructor(uint64 _votesTheshhold, address _builder, address _tokenAddress) {
    votesTheshhold = _votesTheshhold;
    builder = _builder;
    token = IERC20(_tokenAddress);
  }

  function _beforeProofSubmit(
    uint64 /* requestId */,
    uint256[] memory inputs,
    ICircuitValidator validator
  ) internal view override {
    // check that  challenge input is address of sender
    address addr = PrimitiveTypeUtils.int256ToAddress(
      inputs[validator.inputIndexOf("challenge")]
    );
    // this is linking between msg.sender and
    require(_msgSender() == addr, "address in proof is not a sender address");
  }

  function _afterProofSubmit(
    uint64 requestId,
    uint256[] memory inputs,
    ICircuitValidator validator
  ) internal override {
    // get user id
    uint256 id = inputs[1];

    require(
      requestId == TRANSFER_REQUEST_ID && idMap[id] == 0,
      "proof can not be submitted more than once"
    );
    idMap[id] = 1;
    totalVotes++;

    if (totalVotes >= votesTheshhold) {
      uint256 contractBalance = token.balanceOf(address(this));
      // require(contractBalance > 0, "Contract has no token balance");

      token.transfer(builder, contractBalance);

      emit TokensTransferred(address(this), builder, contractBalance);
    }
  }
}
