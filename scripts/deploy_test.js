const { ethers, run } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();

  console.log("Deploying contracts with the account:", deployer.address);

  // convert a currency unit from wei to ether
  const balanceInEth = ethers.utils.formatEther(balance);
  console.log(`Account balance: ${balanceInEth} ETH`);

  const verifierContract = "TokenTransferContract";
  const votesTheshhold = 1;
  const builder = "0xa763ebb58Fc66220F208e697E585a4197A941c84";
  const tokenAddress = "0x844c811c0dc060808ac024b6e300499cbbd574b7";

  const ERC20Verifier = await ethers.getContractFactory(verifierContract);
  const erc20Verifier = await ERC20Verifier.deploy(
    votesTheshhold,
    builder,
    tokenAddress,
  );

  await erc20Verifier.deployed();
  console.log(votesTheshhold, " contract address:", erc20Verifier.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
