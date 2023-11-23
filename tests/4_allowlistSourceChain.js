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

  // console.log(ccipReceiver.functions);

  const ethereumSepoliaSelector = 16015286601757825753n;
  let status = await ccipReciver.allowlistedSourceChains(
    ethereumSepoliaSelector,
  );

  console.log(`CCIP Recevier Contract State
  allowlistedSourceChains: [${ethereumSepoliaSelector}]${status}
  `);

  // const tx = await ccipReciver.allowlistSourceChain(
  //   ethereumSepoliaSelector,
  //   true,
  // );

  // console.log(`Transaction hash: ${tx.hash}`);
  // console.log(`Explorer: https://mumbai.polygonscan.com/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
