const { ethers, run } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();

  console.log("Deploying contracts with the account:", deployer.address);

  // convert a currency unit from wei to ether
  const balanceInEth = ethers.utils.formatEther(balance);
  console.log(`Account balance: ${balanceInEth} ETH`);

  // setup ccip const
  const SepoliaLinkAddress = `0x779877A7B0D9E8603169DdbD7836e478b4624789`;
  const SepoliaRouterAddress = `0xD0daae2231E9CB96b94C8512223533293C3693Bf`;

  // compile
  await run("compile");

  // build contract factory
  const ccipSenderFactory = await ethers.getContractFactory(
    "ProgrammableTokenTransfers", // contract name, not file name
  );
  const ccipSender = await ccipSenderFactory.deploy(
    SepoliaRouterAddress, // deploy 시 순서가 중요함
    SepoliaLinkAddress,
  );

  // deployed
  await ccipSender.deployed();

  console.log(`CCIPSender contract address :${ccipSender.address}`);
  // 0x105290eB93A1D900840d98F79f1CE8572892820b
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
