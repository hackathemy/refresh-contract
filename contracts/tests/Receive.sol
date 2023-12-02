//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.19;

import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

contract Receive {
  uint64 internal constant DEST_CHAIN_ID = 2;
  address internal immutable i_pongContract = address(10);
  address internal immutable i_testTokenAddress = address(1004);

  function testCcipReceiveSuccess() public {
    /*
        struct EVMTokenAmount {
            address token; // token address on the local chain.
            uint256 amount; // Amount of tokens.
        }
    */

    // 배열을 초기화하고 데이터를 추가

    Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](
      1
    );
    // Dummy 데이터 추가
    tokenAmounts[0] = Client.EVMTokenAmount({
      token: i_testTokenAddress, // 원하는 토큰 주소로 대체
      amount: 100 // 원하는 토큰 양으로 대체
    });

    uint256 pingPongNumber = 5;

    // make test message from source chain
    Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
      messageId: bytes32("a"),
      sourceChainSelector: DEST_CHAIN_ID,
      sender: abi.encode(i_pongContract),
      data: abi.encode(pingPongNumber),
      destTokenAmounts: tokenAmounts
    });

    // handle the test sent message from source chain
    // latestMessageId = message.messageId; // fetch the messageId
    // latestMessage = abi.decode(message.data, (string)); // abi-decoding of the sent text
    // Expect one token to be transferred at once, but you can transfer several tokens.
    // receivedTokenAddress = message.destTokenAmounts[0].token;
    // receivedTokenAmount = message.destTokenAmounts[0].amount;

    // changePrank(address(s_sourceRouter));
  }
}
