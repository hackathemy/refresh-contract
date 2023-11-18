const { ethers, run } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();

  console.log("Deploying contracts with the account:", deployer.address);

  // convert a currency unit from wei to ether
  const balanceInEth = ethers.utils.formatEther(balance);
  console.log(`Account balance: ${balanceInEth} ETH`);

  // setup ccip const
  const fujiLinkAddress = `0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846`;
  const fujiRouterAddress = `0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8`;

  // compile
  await run("compile");

  // build contract factory
  const ccipSenderFactory =
    await ethers.getContractFactory("CCIPSender_Unsafe");
  const ccipSender = await ccipSenderFactory.deploy(
    fujiLinkAddress,
    fujiRouterAddress,
  );

  // deployed
  await ccipSender.deployed();

  console.log(`CCIPSender contract address :${ccipSender.address}`);
  // CCIP Sender Contract: 0x55529D0CA12e2C04EaC46A1195d175Bf098Fc024
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
