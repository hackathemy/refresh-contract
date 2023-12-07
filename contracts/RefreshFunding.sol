// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";

contract RefreshFunding is OwnerIsCreator {
  /* Errors */
  error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); // Used to make sure contract has enough balance to cover the fees.
  error SourceChainNotAllowed(uint64 sourceChainSelector); // Used when the source chain has not been allowlisted by the contract owner.
  error TokenNotAllowed(uint256 approvedAmount); // Used when the source chain has not been allowlisted by the contract owner.

  /* Events */
  // Event emitted when a message is sent to another chain.
  event MessageSent(
    bytes32 indexed messageId, // The unique ID of the CCIP message.
    uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
    address receiver, // The address of the receiver on the destination chain.
    uint index, // The project index being funded
    address token, // The token address that was transferred.
    uint256 tokenAmount, // The token amount that was transferred.
    address feeToken, // the token address used to pay CCIP fees.
    uint256 fees // The fees paid for sending the message.
  );

  /* States */
  IERC20 public s_linkToken; // Link token contract in a source chain.
  IRouterClient public s_router; // Router contract in a source chain.
  uint64 public polygonDestinationChainSelector = 12532609583862916517; // Selector number of destination contract in polygon chain.
  bytes32[] public messageList;

  /* Constructor */
  /// @notice Constructor initializes the contract with the router address and link token address in a source chain.
  /// @param _router The address of the ccip router contract which depends on the chain.
  /// @param _link The address of the link contract.
  constructor(address _router, address _link) {
    s_router = IRouterClient(_router);
    s_linkToken = IERC20(_link);
  }

  /* Funtions */
  /// @notice Sends data and transfer tokens to receiver on the destination chain.
  /// @notice Pay for fees in LINK.
  /// @dev Assumes your contract has sufficient LINK to pay for CCIP fees.
  /// @param _receiver The address of the recipient on the destination blockchain.
  /// @param _index The string data to be sent.
  /// @param _token token address.
  /// @param _amount token amount.
  /// @return messageId The ID of the CCIP message that was sent.
  function sendMessagePayLINK(
    address _receiver,
    uint _index,
    address _token,
    uint256 _amount
  ) external returns (bytes32 messageId) {
    // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
    // address(linkToken) means fees are paid in LINK
    Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
      _receiver,
      _index,
      _token,
      _amount,
      address(s_linkToken)
    );

    // Get the fee required to send the CCIP message
    uint256 fees = s_router.getFee(
      polygonDestinationChainSelector,
      evm2AnyMessage
    );

    if (fees > s_linkToken.balanceOf(address(this)))
      revert NotEnoughBalance(s_linkToken.balanceOf(address(this)), fees);

    // approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
    s_linkToken.approve(address(s_router), fees);

    // check a amount of token which was already approved
    uint256 approvedAmount = IERC20(_token).allowance(
      msg.sender,
      address(this)
    );

    // TODO 이거 반대로 수정
    if (_amount < approvedAmount) revert TokenNotAllowed(approvedAmount);

    // send tokens this contract for the Router to use your token with CCIP
    IERC20(_token).transferFrom(msg.sender, address(this), _amount);

    // approve the Router to spend tokens on contract's behalf. It will spend the amount of the given token
    IERC20(_token).approve(address(s_router), _amount);

    // Send the message through the router and store the returned message ID
    messageId = s_router.ccipSend(
      polygonDestinationChainSelector,
      evm2AnyMessage
    );

    // Emit an event with message details
    emit MessageSent(
      messageId,
      polygonDestinationChainSelector,
      _receiver,
      _index,
      _token,
      _amount,
      address(s_linkToken),
      fees
    );

    // Add a new message
    messageList.push(messageId);

    // Return the message ID
    return messageId;
  }

  /// @notice Sends data and transfer tokens to receiver on the destination chain.
  /// @notice Pay for fees in native gas.
  /// @dev Assumes your contract has sufficient native gas like ETH on Ethereum or MATIC on Polygon.
  /// @param _receiver The address of the recipient on the destination blockchain.
  /// @param _index The string data to be sent.
  /// @param _token token address.
  /// @param _amount token amount.
  /// @return messageId The ID of the CCIP message that was sent.
  function sendMessagePayNative(
    address _receiver,
    uint _index,
    address _token,
    uint256 _amount
  ) external returns (bytes32 messageId) {
    // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
    // address(0) means fees are paid in native gas
    Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
      _receiver,
      _index,
      _token,
      _amount,
      address(0)
    );

    // Get the fee required to send the CCIP message
    uint256 fees = s_router.getFee(
      polygonDestinationChainSelector,
      evm2AnyMessage
    );

    if (fees > address(this).balance)
      revert NotEnoughBalance(address(this).balance, fees);

    // check a amount of token which was already approved
    uint256 approvedAmount = IERC20(_token).allowance(
      msg.sender,
      address(this)
    );

    if (_amount < approvedAmount) revert TokenNotAllowed(approvedAmount);

    // send tokens this contract for the Router to use your token with CCIP
    IERC20(_token).transferFrom(msg.sender, address(this), _amount);

    // approve the Router to spend tokens on contract's behalf. It will spend the amount of the given token
    IERC20(_token).approve(address(s_router), _amount);

    // Send the message through the router and store the returned message ID
    messageId = s_router.ccipSend{value: fees}(
      polygonDestinationChainSelector,
      evm2AnyMessage
    );

    // Emit an event with message details
    emit MessageSent(
      messageId,
      polygonDestinationChainSelector,
      _receiver,
      _index,
      _token,
      _amount,
      address(0),
      fees
    );

    // Add a new message
    messageList.push(messageId);

    // Return the message ID
    return messageId;
  }

  /// @notice Construct a CCIP message.
  /// @dev This function will create an EVM2AnyMessage struct with all the necessary information for programmable tokens transfer.
  /// @param _receiver The address of the receiver.
  /// @param _index The string data to be sent.
  /// @param _token The token to be transferred.
  /// @param _amount The amount of the token to be transferred.
  /// @param _feeTokenAddress The address of the token used for fees. Set address(0) for native gas.
  /// @return Client.EVM2AnyMessage Returns an EVM2AnyMessage struct which contains information for sending a CCIP message.
  function _buildCCIPMessage(
    address _receiver,
    uint _index,
    address _token,
    uint256 _amount,
    address _feeTokenAddress
  ) internal view returns (Client.EVM2AnyMessage memory) {
    // Set the token amounts
    Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](
      1
    );
    tokenAmounts[0] = Client.EVMTokenAmount({token: _token, amount: _amount});
    // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
    return
      Client.EVM2AnyMessage({
        receiver: abi.encode(_receiver), // ABI-encoded receiver address
        data: abi.encode(msg.sender, _index), // ABI-encoded string with sender address
        tokenAmounts: tokenAmounts, // The amount and type of token being transferred
        extraArgs: Client._argsToBytes(
          // Additional arguments, setting gas limit and non-strict sequencing mode
          Client.EVMExtraArgsV1({gasLimit: 200_000, strict: false})
        ),
        // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
        feeToken: _feeTokenAddress
      });
  }

  /// @notice Fallback function to allow the contract to receive Ether.
  /// @dev This function has no function body, making it a default function for receiving Ether.
  /// It is automatically called when Ether is sent to the contract without any data.
  receive() external payable {}
}
