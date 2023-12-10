const { networks } = require("../networks");
const contractName = "RefreshFunding";

task(
  "approve-token",
  `Approve BnM token to transferFrom funding contract in source chain`,
)
  .addParam("amount", "funding amount")
  .setAction(async (taskArgs, hre) => {
    let { amount } = taskArgs;

    const [deployer] = await hre.ethers.getSigners();
    const balance = await deployer.getBalance();
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
      "function approve(address spender, uint256 amount) returns (bool)",
    ];

    // Get the balance of the ERC-20 token at the specified timestamp
    const tokenContract = new ethers.Contract(tokenAddress, abi, deployer);
    const tx = await tokenContract.approve(fundingAddress, amount);

    console.log(`${networks[network.name].explorer(tx.hash)}`);
  });
