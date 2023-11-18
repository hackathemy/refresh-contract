const { ethers, run } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();

  console.log("Deploying contracts with the account:", deployer.address);

  // convert a currency unit from wei to ether
  const balanceInEth = ethers.utils.formatEther(balance);
  console.log(`Account balance: ${balanceInEth} ETH`);

  // setup const
  const mumbaiRouterAddress = `0x70499c328e1e2a3c41108bd3730f6670a44595d1`;

  // compile
  await run("compile");

  // build contract factory
  const ccipReceiverFactory = await ethers.getContractFactory(
    "CCIPReceiver_Unsafe",
  );
  // deploy
  const ccipReceiver = await ccipReceiverFactory.deploy(mumbaiRouterAddress);
  await ccipReceiver.deployed();

  console.log(`CCIPReceiver_Unsafe deployed to ${ccipReceiver.address}`);
  // Poly MumBai CCIP Receiver Contract: 0x7B5727Ca11432A5c8150C45291EE34225B674A1B
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
