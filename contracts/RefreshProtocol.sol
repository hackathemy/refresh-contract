//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ProjectToken.sol";
import {PrimitiveTypeUtils} from "@iden3/contracts/lib/PrimitiveTypeUtils.sol";
import {ICircuitValidator} from "@iden3/contracts/interfaces/ICircuitValidator.sol";
import {ZKPVerifier} from "@iden3/contracts/verifiers/ZKPVerifier.sol";

contract RefreshProtocol is CCIPReceiver, ZKPVerifier {
  /* Errors */
  error IndexOutOfBound(uint projectIndex); // Used when the project index is out of bounds.
  error MessageIdNotExist(bytes32 messageId); // Used when the provided message ID does not exist.
  error NoMessageReceived(); // Used when trying to access a message but no messages have been received.
  error BuilderNotAllowlisted(address builder);

  /* Events */
  // Event emitted when a new project is created by builder.
  event ProjectCreated(
    uint indexed contentIndex,
    address indexed projectBuilder,
    string contentURI,
    address tokenAddress // Added to store the token contract address
  );

  // Event emitted when a message is received from another chain.
  event MessageReceived(
    bytes32 indexed messageId, // The unique ID of the message.
    address funder, // The address of the funder from source chain.
    uint indexed projectIndex, // The chain selector of the source chain.
    Client.EVMTokenAmount tokenAmount // The token amount that was funded.
  );

  /* States */
  // For ZK requestss
  uint64 public constant CREATE_PROJECT_REQUEST_ID = 1;
  uint64 public constant VOTE_REQUEST_ID = 2;
  uint64 public constant WITHDRAW_REQUEST_ID = 3;

  // For Polygon ID
  address public constant BNM_TOKEN =
    0xf1E3A5842EeEF51F2967b3F05D45DD4f4205FF40;

  address public zkVerifier;

  // types for Message
  struct MessageIn {
    address funder; // The address of the funder from source chain.
    uint projectIndex; // A index of project index which funder want to fund to
    address token; // funded token.
    uint256 amount; // funded amount.
  }

  // Storage variables.
  bytes32[] public receivedMessages; // Array to keep track of the IDs of received messages.
  mapping(bytes32 => MessageIn) public messageDetail; // Mapping from message ID to MessageIn struct, storing details of each received message.

  // types for Projects
  struct Project {
    uint contentIndex;
    address projectBuilder;
    string contentURI;
    address tokenAddress; // Added to store the token contract address
  }

  mapping(address => bool) public allowlistedBuilder;
  mapping(uint => Project) public projects;
  uint latestProjectIndex;

  constructor(address router, address _zkVerifier) CCIPReceiver(router) {
    zkVerifier = _zkVerifier;
  }

  /* Modifier */
  modifier onlyAllowlistedBuilder(address _builder) {
    if (!allowlistedBuilder[_builder]) revert BuilderNotAllowlisted(_builder);
    _;
  }

  /* Functons */
  /// handle a received message
  function _ccipReceive(
    Client.Any2EVMMessage memory receivedMessage
  ) internal override {
    // fetch the messageId
    bytes32 messageId = receivedMessage.messageId;

    // fetch the funder address and funded index
    (address funder, uint projectIndex) = abi.decode(
      receivedMessage.data,
      (address, uint)
    );

    // validate if the index is correct or not
    if (projectIndex > latestProjectIndex || projectIndex < 1)
      revert IndexOutOfBound(projectIndex);

    // Collect tokens transferred. This increases this contract's balance for that Token.
    Client.EVMTokenAmount[] memory tokenAmounts = receivedMessage
      .destTokenAmounts;
    address token = tokenAmounts[0].token;
    uint256 amount = tokenAmounts[0].amount;

    // store state
    receivedMessages.push(messageId);
    MessageIn memory detail = MessageIn(funder, projectIndex, token, amount);
    messageDetail[messageId] = detail;

    // emit event
    emit MessageReceived(messageId, funder, projectIndex, tokenAmounts[0]);

    // mint a erc20 token to funder
    ProjectToken(payable(projects[projectIndex].tokenAddress)).mint(
      funder,
      amount
    );

    IERC20(token).transfer(zkVerifier, amount);
  }

  // create a new prject and mint erc20votes
  function createProject(
    string calldata _contentURI,
    string calldata tokenName,
    string calldata tokenSymbol
  ) external onlyAllowlistedBuilder(msg.sender) {
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

  function getReceivedMessageDetails(
    bytes32 messageId
  ) external view returns (address, uint, address token, uint256 amount) {
    MessageIn memory detail = messageDetail[messageId];
    if (detail.funder == address(0)) revert MessageIdNotExist(messageId);
    return (detail.funder, detail.projectIndex, detail.token, detail.amount);
  }

  function getLastReceivedMessageDetails()
    external
    view
    returns (bytes32 messageId, address, uint, address, uint256)
  {
    // Revert if no messages have been received
    if (receivedMessages.length == 0) revert NoMessageReceived();

    // Fetch the last received message ID
    messageId = receivedMessages[receivedMessages.length - 1];

    // Fetch the details of the last received message
    MessageIn memory detail = messageDetail[messageId];

    return (
      messageId,
      detail.funder,
      detail.projectIndex,
      detail.token,
      detail.amount
    );
  }

  /// @notice Fallback function to allow the contract to receive Ether.
  /// @dev This function has no function body, making it a default function for receiving Ether.
  /// It is automatically called when Ether is sent to the contract without any data.
  receive() external payable {}

  /* ZK Implecations */
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

    if (requestId == CREATE_PROJECT_REQUEST_ID) {
      address builder = _msgSender();
      allowlistedBuilder[builder] = true;
    }
  }
}
