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

  const ccipReceiverAddress = `0x2C8722aFBBE94a2feF60d0034209AD11C1960ca2`;
  const ccipReceiverFactory = await hre.ethers.getContractFactory(
    "ProgrammableTokenTransfers",
  );
  const ccipReciver = await ccipReceiverFactory.attach(ccipReceiverAddress);

  const ccipSenderContract = `0x105290eB93A1D900840d98F79f1CE8572892820b`;
  let status = await ccipReciver.allowlistedSenders(ccipSenderContract);

  console.log(`CCIP Recevier Contract State
  allowlistedSourceChains: [${ccipSenderContract}]${status}
  `);

  // const tx = await ccipReciver.allowlistSender(ccipSenderContract, true);
  // console.log(`Transaction hash: ${tx.hash}`);
  // console.log(`Explorer: https://mumbai.polygonscan.com/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
