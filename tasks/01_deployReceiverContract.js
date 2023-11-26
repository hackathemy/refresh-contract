const { networks } = require("../networks");
/**
 * npx hardhat task...
 * @param1 task name (example: in this code, task name is "setup-sender")
 * @param2 task description (example: in this code, task description is "deploy Sender.sol")
 *
 * @flag network.name depends on a flag, --network <name>
 */
// TODO: need to change setup-receiver description
task("setup-receiver", "TODO HERE!").setAction(async (taskArgs, hre) => {
  if (network.name === "hardhat") {
    // throw Error(
    //   "This command cannot be used on a local development chain.  Specify a valid network.",
    // );
    console.log(`__CAUTION!__\nYOU'RE IN THE TEST HARDHAT NETWORK`);
  }

  // TODO: change to mumbai, in our case, we will deploy receiver contract in only polygon mumbai network!
  // if (network.name !== "fuji") {
  //   throw Error("This task is intended to be executed on the Fuji network.");
  // }

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

  const bnmToken = networks[network.name].bnmToken;
  const ROUTER = networks[network.name].router;
  const LINK = networks[network.name].linkToken;
  if (!bnmToken || !ROUTER || !LINK) {
    throw Error(
      "Missing |BNM Token Address| or |Router Address| or |LINK Token Address|",
    );
  }

  // TODO: we change to simulate our user work flow
  const TOKEN_TRANSFER_AMOUNT = "0.0001";
  const LINK_AMOUNT = "0.5";

  console.log("\n__Compiling Contracts__");
  await run("compile");

  console.log(`\n__Deploying Contract__
Deploying Sender.sol to ${network.name}...
Please wait for a while to mine your tx`);

  const receiverFactory = await ethers.getContractFactory(
    "CCIPReceiver_Custom",
  );
  const receiverContract = await receiverFactory.deploy(ROUTER);
  await receiverContract.deployTransaction.wait(1);

  // TODO: change logs
  console.log(`\n__Deployed Contract__
Reciver contract is deployed to ${network.name} at ${receiverContract.address}
Explorer: ${networks[network.name].explorer(
    receiverContract.deployTransaction.hash,
  )}
`);
});
