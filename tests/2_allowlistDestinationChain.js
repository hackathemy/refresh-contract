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

  // console.log(ccipReceiver.functions);

  const polygonMumbaiSelector = 12532609583862916517n;
  let status = await ccipSender.allowlistedDestinationChains(
    polygonMumbaiSelector,
  );

  console.log(`CCIP Recevier Contract State
  allowlistedSourceChains: [${polygonMumbaiSelector}]${status}
  `);

  const tx = await ccipSender.allowlistDestinationChain(
    polygonMumbaiSelector,
    true,
  );

  console.log(`Transaction hash: ${tx.hash}`);
  console.log(`Explorer: https://sepolia.etherscan.io/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
