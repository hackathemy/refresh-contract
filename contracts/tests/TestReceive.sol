//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

/*
THIS IS ONLY USING FOR TEST. DON'T DEPOLY IN A REAL NETWORK
*/

import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "hardhat/console.sol";
import "../ProjectToken.sol";

contract TestReceive {
  // const setup
  uint64 internal constant DEST_CHAIN_ID = 2;
  address internal immutable s_sourceChainSender =
    0xa0DBD950C5E6F768968135Ab4c055936D5f16CDD;
  address internal immutable t_sourceTokenAddress = address(20);

  struct Project {
    uint contentIndex;
    address projectBuilder;
    string contentURI;
    address tokenAddress;
  }
  mapping(uint => Project) public projects;
  uint latestProjectIndex;

  // setup for testing
  constructor() {
    console.log("__Deploying a test contract with some test setup data__");
    string memory t_tokenName = "Test Token";
    string memory t_tokenSymbol = "TT";

    ProjectToken testToken = new ProjectToken(t_tokenName, t_tokenSymbol);
    latestProjectIndex++;

    Project storage newProject = projects[latestProjectIndex];
    newProject.contentIndex = latestProjectIndex;
    newProject.projectBuilder = msg.sender;
    newProject.contentURI = "ipfs://test.uri";
    newProject.tokenAddress = address(testToken);

    console.log("Test ERC20 Token's name:    %s", t_tokenName);
    console.log("Test ERC20 Token's symbol:  %s", t_tokenSymbol);
    console.log("Test ERC20 Token's address: %s\n", address(testToken));
  }

  // test function for ccip
  function ccipReceive() public {
    console.log("__Calling a test function named ccipReceive__");

    // Make a dummy message received data from source chain for testing
    Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](
      1
    );
    tokenAmounts[0] = Client.EVMTokenAmount({
      token: t_sourceTokenAddress,
      amount: 100
    });
    Client.Any2EVMMessage memory receivedMessage = Client.Any2EVMMessage({
      messageId: bytes32("a"),
      sourceChainSelector: DEST_CHAIN_ID,
      data: abi.encode("1"), // 여기에 프로젝트 index가 들어와야 하고
      sender: abi.encode(s_sourceChainSender), // 이게 소스체인에서 보낸 사람의 주소
      destTokenAmounts: tokenAmounts
    });

    // check index
    // revert 필요 -> 만약 없는 프로젝트 인덱스를 고른 경우
    string memory receivedStringIndex = abi.decode(
      receivedMessage.data,
      (string)
    );
    uint receivedProjectIndex = stringToUint(receivedStringIndex);
    console.log(
      "Received Project Index: '%s', Its token address: %s",
      receivedProjectIndex,
      projects[receivedProjectIndex].tokenAddress
    );

    // check token amount
    uint256 mintAmount = receivedMessage.destTokenAmounts[0].amount;
    console.log(
      "Recevied token amount: %o, It will be used in mint function",
      mintAmount
    );

    // check sender address
    address funder = abi.decode(receivedMessage.sender, (address)); // abi-decoding of the sender address

    // mint a test token to funder
    // ProjectToken testTokenContract = ProjectToken(
    //   payable(projects[latestProjectIndex].tokenAddress)
    // );
    // testTokenContract.mint(address(10), mintAmount);
    ProjectToken(payable(projects[latestProjectIndex].tokenAddress)).mint(
      funder,
      mintAmount
    );
  }

  // unused testing function. just memo
  function testCcipReceiveSuccess()
    public
    view
    returns (
      // internal: 내부에서 사용 예정
      // view: 함수가 상태를 변경하지 않음
      Client.Any2EVMMessage memory // memory: 상태를 외부로 반환하지 않고, 메모리 영역에 저장해두고 실행 완료 후 삭제
    )
  {
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
      token: address(10), // 원하는 토큰 주소로 대체
      amount: 100 // 원하는 토큰 양으로 대체
    });

    uint256 pingPongNumber = 5;

    // make test message from source chain
    Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
      messageId: bytes32("a"),
      sourceChainSelector: DEST_CHAIN_ID,
      sender: abi.encode(""),
      data: abi.encode(pingPongNumber),
      destTokenAmounts: tokenAmounts
    });

    // return test message
    return message;
  }

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
