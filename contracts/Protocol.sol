//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ProjectToken.sol";

contract RefreshProtocol is CCIPReceiver, OwnerIsCreator {
  // public make a getter function for this argument
  bytes32 public latestMessageId; // Store the last received messageId.
  string public latestMessage;
  address public latestSender;
  address public lastReceivedTokenAddress; // Store the last received token address.
  uint256 public lastReceivedTokenAmount; // Store the last received amount.

  event ProjectCreated(
    uint indexed contentIndex,
    address indexed projectBuilder,
    string contentURI,
    address tokenAddress // Added to store the token contract address
  );

  struct Project {
    uint contentIndex;
    address projectBuilder;
    string contentURI;
    address tokenAddress; // Added to store the token contract address
  }

  mapping(uint => Project) public projects;

  uint latestProjectIndex;

  constructor(address router) CCIPReceiver(router) {
    // something here
  }

  /// handle a received message
  function _ccipReceive(
    Client.Any2EVMMessage memory receivedMessage
  ) internal override {
    // check index
    // TODO: revert 필요 -> 만약 없는 프로젝트 인덱스를 고른 경우
    string memory receivedStringIndex = abi.decode(
      receivedMessage.data,
      (string)
    );
    uint receivedProjectIndex = stringToUint(receivedStringIndex);

    // check token amount & sender
    uint256 mintAmount = receivedMessage.destTokenAmounts[0].amount;
    address funder = abi.decode(receivedMessage.sender, (address));

    // mint a test token to funder
    ProjectToken(payable(projects[receivedProjectIndex].tokenAddress)).mint(
      funder,
      mintAmount
    );

    // store state
    // TODO: if it's not variable, we don't store this state at our contract
    latestMessageId = receivedMessage.messageId;
    latestMessage = receivedStringIndex;
    lastReceivedTokenAddress = receivedMessage.destTokenAmounts[0].token;
    lastReceivedTokenAmount = receivedMessage.destTokenAmounts[0].amount;
  }

  // create a new prject and mint erc20votes
  function createProject(
    string calldata _contentURI,
    string calldata tokenName,
    string calldata tokenSymbol
  ) external {
    // Increment the index to get a new unique index for the project
    latestProjectIndex++;

    // Create a new ERC20 token for the project
    ProjectToken newToken = new ProjectToken(tokenName, tokenSymbol);

    // Store a new project
    Project storage newProject = projects[latestProjectIndex];
    newProject.contentIndex = latestProjectIndex;
    newProject.projectBuilder = msg.sender;
    newProject.contentURI = _contentURI;
    newProject.tokenAddress = address(newToken); // Store the token contract address

    // Emit the ProjectCreated event
    emit ProjectCreated(
      latestProjectIndex,
      msg.sender,
      _contentURI,
      address(newToken)
    );
  }

  // getter function to find out project erc20 token contract address for users
  function getProjectsTokenContract(
    uint _projectIndex
  ) external view returns (address) {
    return projects[_projectIndex].tokenAddress;
  }

  function getProjectsCount() external view returns (uint) {
    return latestProjectIndex;
  }

  // getter function call project uri for frontend to query this uri
  function getProjectContentURI(
    uint projectIndex
  ) external view returns (string memory) {
    require(
      projectIndex > 0 && projectIndex <= latestProjectIndex,
      "Invalid project index"
    );
    return projects[projectIndex].contentURI;
  }

  /**
   * @notice Returns the details of the last CCIP received message.
   * @dev This function retrieves the ID, text, token address, and token amount of the last received CCIP message.
   * @return messageId The ID of the last received CCIP message.
   * @return text The text of the last received CCIP message.
   * @return tokenAddress The address of the token in the last CCIP received message.
   * @return tokenAmount The amount of the token in the last CCIP received message.
   */
  function getLastReceivedMessageDetails()
    public
    view
    returns (
      bytes32 messageId,
      string memory text,
      address tokenAddress,
      uint256 tokenAmount
    )
  {
    return (
      latestMessageId,
      latestMessage,
      lastReceivedTokenAddress,
      lastReceivedTokenAmount
    );
  }

  // temp
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
