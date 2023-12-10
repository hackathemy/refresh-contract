const { networks } = require("../networks");
const contractName = "RefreshProtocol";

/**
 * npx hardhat task...
 * @param1 task name (example: in this code, task name is "setup-sender")
 * @param2 task description (example: in this code, task description is "deploy Sender.sol")
 *
 * @flag network.name depends on a flag, --network <name>
 */
// TODO: need to change setup-receiver description
task(
  "check-project",
  `deploy sender ${contractName} contract on the network which you select by --network flag`,
).setAction(async (taskArgs, hre) => {
  if (network.name === "hardhat") {
    // throw Error(
    //   "This command cannot be used on a local development chain.  Specify a valid network.",
    // );
    console.log(`__CAUTION!__\nYOU'RE IN THE TEST HARDHAT NETWORK`);
  }

  if (network.name !== "mumbai") {
    throw Error(
      "This task is intended to be executed on the polygon mumbai network.",
    );
  }
  console.log(`\n__Selected Network__ : ${network.name}
The network will be used for deploying receiver contract
`);

  const [deployer] = await hre.ethers.getSigners();
  const balance = await deployer.getBalance();
  // convert a currency unit from wei to ether
  const balanceInEth = hre.ethers.utils.formatEther(balance);

  console.log(`__Selected Account__ : ${deployer.address}
The account will deploy the contarct as a signer
The account currently has ${balanceInEth} ${
    networks[network.name].nativeCurrencySymbol
  }`);

  console.log("\n__Compiling Contracts__");
  await run("compile");

  const protocolAddress = networks[network.name].protocol;
  const receiverFactory = await ethers.getContractFactory(contractName);
  const receiver = await receiverFactory.attach(protocolAddress);

  const tx = await receiver.projects(1);
  console.log(tx);
  // console.log(`\n__Deployed Contract__
  // Reciver contract is deployed to ${network.name} at ${receiverContract.address}
  // Explorer: ${networks[network.name].explorer(tx.hash)}
  // `);
});
