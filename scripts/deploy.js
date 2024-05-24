const { ethers, run } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();

  console.log("Deploying contracts with the account:", deployer.address);

  // convert a currency unit from wei to ether
  const balanceInEth = ethers.utils.formatEther(balance);
  console.log(`Account balance: ${balanceInEth} ETH`);

  const verifierContract = "ERC20Verifier";

  const votesTheshhold = 1;
  const tokenAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";

  const ERC20Verifier = await ethers.getContractFactory(verifierContract);
  const erc20Verifier = await ERC20Verifier.deploy(
    votesTheshhold,
    tokenAddress,
  );

  await erc20Verifier.deployed();
  console.log(verifierName, " address:", erc20Verifier.address);
  //   console.log(`CCIPReceiver_Unsafe deployed to ${ccipReceiver.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
