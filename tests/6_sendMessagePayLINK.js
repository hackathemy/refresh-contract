const hre = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  const balance = await signer.getBalance();
  const { chainId } = await ethers.provider.getNetwork();

  console.log(`Connected network chain id: ${chainId}`);

  const signerAddress = signer.address;
  console.log("Connected account address:", signerAddress);

  // convert a currency unit from wei to ether
  const balanceInEth = ethers.utils.formatEther(balance);
  console.log(`Account balance: ${balanceInEth} ETH`);

  const ccipSenderAddress = `0x105290eB93A1D900840d98F79f1CE8572892820b`;
  const ccipSenderFactory = await hre.ethers.getContractFactory(
    "ProgrammableTokenTransfers",
  );
  const ccipSender = await ccipSenderFactory.attach(ccipSenderAddress);
  const polygonMumbaiSelector = 12532609583862916517n;

  /*
    function sendMessagePayLINK(
    uint64 _destinationChainSelector,
    address _receiver,
    string calldata _text,
    address _token,
    uint256 _amount
  )
  */
  const tx = await ccipSender.sendMessagePayLINK(
    polygonMumbaiSelector,
    `0x2C8722aFBBE94a2feF60d0034209AD11C1960ca2`,
    `Hello Jeongseup`,
    `0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05`,
    1000000000000000n,
  );

  console.log(`Transaction hash: ${tx.hash}`);
  console.log(`Explorer: https://sepolia.etherscan.io/tx/${tx.hash}`);
  console.log(`Explorer: https://ccip.chain.link/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
