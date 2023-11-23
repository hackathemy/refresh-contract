const { ethers, run } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();

  console.log("Deploying contracts with the account:", deployer.address);

  // convert a currency unit from wei to ether
  const balanceInEth = ethers.utils.formatEther(balance);
  console.log(`Account balance: ${balanceInEth} ETH`);

  // setup ccip const
  const MumbaiLinkAddress = `0x326C977E6efc84E512bB9C30f76E30c160eD06FB`;
  const MumbaiRouterAddress = `0x70499c328e1E2a3c41108bd3730F6670a44595D1`;

  // compile
  await run("compile");

  // build contract factory
  const ccipReceiverFactory = await ethers.getContractFactory(
    "ProgrammableTokenTransfers", // contract name, not file name
  );
  const ccipReciver = await ccipReceiverFactory.deploy(
    MumbaiRouterAddress, // deploy 시 순서가 중요함
    MumbaiLinkAddress,
  );

  // deployed
  await ccipReciver.deployed();

  console.log(`CCIPReceiver contract address :${ccipReciver.address}`);
  // 0x2C8722aFBBE94a2feF60d0034209AD11C1960ca2
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
