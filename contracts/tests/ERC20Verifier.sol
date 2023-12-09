// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../lib/GenesisUtils.sol";
import "../interfaces/ICircuitValidator.sol";
import "../verifiers/ZKPVerifier.sol";

contract ERC20Verifier is ZKPVerifier {
  mapping(uint256 => address) public idToAddress;
  mapping(address => uint256) public addressToId;

  // custom
  uint64 public constant TRANSFER_REQUEST_ID = 1701840378;
  uint64 public totalVotes = 0;
  uint256 public votesTheshhold;
  IERC20 public token;
  address builder;

  mapping(uint256 => uint256) public idMap;

  event TokensTransferred(
    address indexed from,
    address indexed to,
    uint256 amount
  );

  constructor(uint64 _votesTheshhold, address _tokenAddress) {
    votesTheshhold = _votesTheshhold;
    token = IERC20(_tokenAddress);
    builder = msg.sender;
  }

  function _beforeProofSubmit(
    uint64 /* requestId */,
    uint256[] memory inputs,
    ICircuitValidator validator
  ) internal view override {
    // check that challenge input of the proof is equal to the msg.sender
    address addr = GenesisUtils.int256ToAddress(
      inputs[validator.getChallengeInputIndex()]
    );
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

    // if (totalVotes >= votesTheshhold) {
    uint256 contractBalance = token.balanceOf(address(this));
    // require(contractBalance > 0, "Contract has no token balance");

    token.transfer(builder, contractBalance);
    emit TokensTransferred(address(this), builder, contractBalance);
    // }
  }

  // function _afterProofSubmit(
  //   uint64 requestId,
  //   uint256[] memory inputs,
  //   ICircuitValidator validator
  // ) internal override {
  //   require(
  //     requestId == TRANSFER_REQUEST_ID && addressToId[_msgSender()] == 0,
  //     "proof can not be submitted more than once"
  //   );

  //   uint256 id = inputs[validator.getChallengeInputIndex()];
  //   // execute the logic
  //   if (idToAddress[id] == address(0)) {
  //     super._mint(_msgSender(), TOKEN_AMOUNT_PER_ID);
  //     addressToId[_msgSender()] = id;
  //     idToAddress[id] = _msgSender();
  //   }
  // }
}
