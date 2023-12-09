// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";

contract FundingTest is OwnerIsCreator {
  // Custom errors to provide more descriptive revert messages.
  error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); // Used to make sure contract has enough balance to cover the fees.
  error SourceChainNotAllowed(uint64 sourceChainSelector); // Used when the source chain has not been allowlisted by the contract owner.

  IERC20 public s_linkToken;
  IRouterClient public s_router;
  uint64 public polygonDestinationChainSelector = 12532609583862916517;

  /// @notice Constructor initializes the contract with the router address.
  /// @param _router The address of the ccip router contract which depends on the chain.
  /// @param _link The address of the link contract.
  constructor(address _router, address _link) {
    s_router = IRouterClient(_router);
    s_linkToken = IERC20(_link);
  }

  /// @notice Sends data and transfer tokens to receiver on the destination chain.
  /// @notice Pay for fees in LINK.
  /// @dev Assumes your contract has sufficient LINK to pay for CCIP fees.
  /// @param _receiver The address of the recipient on the destination blockchain.
  /// @param _text The string data to be sent.
  /// @param _token token address.
  /// @param _amount token amount.
  /// @return messageId The ID of the CCIP message that was sent.
  function sendMessagePayLINK(
    address _receiver,
    string calldata _text,
    address _token,
    uint256 _amount
  ) external returns (bytes32 messageId) {
    // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
    // address(linkToken) means fees are paid in LINK
    Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
      _receiver,
      _text,
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

    // 여기에 link send도 같이 넣으면 될 것 같긴 함 테스트 아직 안해봄

    // approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
    IERC20(_token).transfer(address(tx.origin), _amount);

    // send tokens this contract for the Router to use your token with CCIP
    // IERC20(payable(_token)).transfer(address(msg.sender), _amount);

    // approve the Router to spend tokens on contract's behalf. It will spend the amount of the given token
    IERC20(_token).approve(address(s_router), _amount);

    // Send the message through the router and store the returned message ID
    messageId = s_router.ccipSend(
      polygonDestinationChainSelector,
      evm2AnyMessage
    );

    // Return the message ID
    return messageId;
  }

  /// @notice Sends data and transfer tokens to receiver on the destination chain.
  /// @notice Pay for fees in native gas.
  /// @dev Assumes your contract has sufficient native gas like ETH on Ethereum or MATIC on Polygon.
  /// @param _receiver The address of the recipient on the destination blockchain.
  /// @param _text The string data to be sent.
  /// @param _token token address.
  /// @param _amount token amount.
  /// @return messageId The ID of the CCIP message that was sent.
  function sendMessagePayNative(
    address _receiver,
    string calldata _text,
    address _token,
    uint256 _amount
  ) external returns (bytes32 messageId) {
    // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
    // address(0) means fees are paid in native gas
    Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
      _receiver,
      _text,
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

    // approve the Router to spend tokens on contract's behalf. It will spend the amount of the given token
    IERC20(_token).approve(address(s_router), _amount);

    // Send the message through the router and store the returned message ID
    messageId = s_router.ccipSend{value: fees}(
      polygonDestinationChainSelector,
      evm2AnyMessage
    );

    // Return the message ID
    return messageId;
  }

  /// @notice Construct a CCIP message.
  /// @dev This function will create an EVM2AnyMessage struct with all the necessary information for programmable tokens transfer.
  /// @param _receiver The address of the receiver.
  /// @param _text The string data to be sent.
  /// @param _token The token to be transferred.
  /// @param _amount The amount of the token to be transferred.
  /// @param _feeTokenAddress The address of the token used for fees. Set address(0) for native gas.
  /// @return Client.EVM2AnyMessage Returns an EVM2AnyMessage struct which contains information for sending a CCIP message.
  function _buildCCIPMessage(
    address _receiver,
    string calldata _text,
    address _token,
    uint256 _amount,
    address _feeTokenAddress
  ) internal pure returns (Client.EVM2AnyMessage memory) {
    // Set the token amounts
    Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](
      1
    );
    tokenAmounts[0] = Client.EVMTokenAmount({token: _token, amount: _amount});
    // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
    return
      Client.EVM2AnyMessage({
        receiver: abi.encode(_receiver), // ABI-encoded receiver address
        data: abi.encode(_text), // ABI-encoded string
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
