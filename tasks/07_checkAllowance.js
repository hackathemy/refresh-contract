const { networks } = require("../networks");
const contractName = "RefreshFunding";

task(
  "check-allowance",
  `deploy sender ${contractName} contract on the network which you select by --network flag`,
).setAction(async (taskArgs, hre) => {
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

  const fundingAddress = networks[network.name].fundingContract;
  const tokenAddress = networks[network.name].bnmToken;
  const ownderAddress = deployer.address;
  const abi = [
    "function allowance(address owner, address spender) external view returns (uint256)",
  ];

  // Get the balance of the ERC-20 token at the specified timestamp
  const tokenContract = new ethers.Contract(tokenAddress, abi, deployer);
  const allowanceBalance = await tokenContract.allowance(
    ownderAddress,
    fundingAddress,
  );

  console.log(`Allowance Balance : ${allowanceBalance}`);
});
