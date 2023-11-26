// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

contract CCIPReceiver_Custom is CCIPReceiver {
  // public make a getter function for this argument
  string public latestMessage;
  address public latestSender;

  constructor(address router) CCIPReceiver(router) {}

  function _ccipReceive(
    Client.Any2EVMMessage memory message
  ) internal virtual override {
    latestMessage = abi.decode(message.data, (string));
    latestSender = abi.decode(message.sender, (address));
  }
}
