const { ethers, run } = require("hardhat");

// ref: https://community.infura.io/t/ethers-js-how-to-get-the-eth-erc-20-tokens-balance-of-an-address-at-a-particular-timestamp/7026
// ref: https://docs.ethers.org/v5/api/contract/example/
async function main() {
  const [signer] = await ethers.getSigners();
  const balance = await signer.getBalance();
  const { chainId } = await ethers.provider.getNetwork();

  console.log(`Connected network chain id: ${chainId}`);

  const signerAddress = signer.address;
  console.log("Connected account address:", signerAddress);

  // convert a currency unit from wei to ether
  const balanceInEth = ethers.utils.formatEther(balance);
  console.log(`Account balance: ${balanceInEth} ETH`);

  // Set the contract address and ABI of the ERC-20 token you want to check the balance of
  const tokenAddress = `0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846`; // avalanche fuji link token address
  // const tokenAbi = ["function balanceOf(address) view returns (uint256)", ""];

  // A Human-Readable ABI; for interacting with the contract, we
  // must include any fragment we wish to use
  const abi = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",

    // Authenticated Functions
    "function transfer(address to, uint amount) returns (bool)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint amount)",
  ];

  // Get the balance of the ERC-20 token at the specified timestamp
  const tokenContract = new ethers.Contract(tokenAddress, abi, signer);
  const tokenBalance = await tokenContract.balanceOf(signerAddress);
  const tokenbalanceInEth = ethers.utils.formatEther(tokenBalance);

  console.log(`Token balance of ${signerAddress}: ${tokenbalanceInEth} LINK`);

  // ethers.utils.for
  const faucetAmountInETH = "1";
  console.log(`Transfer token amount: ${faucetAmountInETH} LINK`);

  const faucetValue = ethers.utils.parseUnits(faucetAmountInETH, "ether");

  const ccipSenderContract = `0x55529D0CA12e2C04EaC46A1195d175Bf098Fc024`;
  const tx = await tokenContract.transfer(
    ccipSenderContract,
    ethers.utils.parseUnits(faucetAmountInETH),
  );

  await tx.wait();

  console.log("tx:", tx);
  console.log("tx hash:", tx.hash);

  const contractTokenBalance =
    await tokenContract.balanceOf(ccipSenderContract);
  console.log(
    `Token balance of ${ccipSenderContract}: ${contractTokenBalance} LINK`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
