const { networks } = require("../networks");
const contractName = "CCIPTokenSender";

/**
 * npx hardhat task...
 * @param1 task name (example: in this code, task name is "setup-sender")
 * @param2 task description (example: in this code, task description is "deploy Sender.sol")
 */
task(
  "setup-sender",
  `deploy sender ${contractName} contract on the network which you select by --network flag`,
).setAction(async (taskArgs, hre) => {
  const networkName = network.name;

  console.log(`\n__Selected Network__ : ${networkName}
  The network will be used for deploying receiver contract
  `);

  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  // convert a currency unit from wei to ether
  const balanceInEth = ethers.utils.formatEther(balance);
  console.log(`__Selected Account__ : ${deployer.address}
  The account will deploy the contarct as a signer
  The account currently has ${balanceInEth} ${networks[networkName].nativeCurrencySymbol}`);

  const bnmToken = networks[networkName].bnmToken;
  const ROUTER = networks[networkName].router;
  const LINK = networks[networkName].linkToken;
  if (!bnmToken || !ROUTER || !LINK) {
    throw Error(
      "Missing |BNM Token Address| or |Router Address| or |LINK Token Address|",
    );
  }

  console.log(`\n__Compiling Contracts__ : ${contractName}`);
  await run("compile");

  const contractFactory = await ethers.getContractFactory(contractName);
  const contract = await contractFactory.deploy(ROUTER, LINK);
  await contract.deployTransaction.wait(1);

  console.log(`\n__Deploying Contract__ : ${contractName}.sol`);
  console.log(`${contractName} contract is just created on the ${networkName}. 
  Contract Address: ${contract.address}`);
});
