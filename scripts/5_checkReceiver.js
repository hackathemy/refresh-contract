const hre = require("hardhat");

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

  const ccipReceiverAddress = `0x7B5727Ca11432A5c8150C45291EE34225B674A1B`;
  const ccipReceiverFactory = await hre.ethers.getContractFactory(
    "CCIPReceiver_Unsafe",
  );
  const ccipReceiver = await ccipReceiverFactory.attach(ccipReceiverAddress);

  // console.log(ccipReceiver.functions);

  const latestSender = await ccipReceiver.latestSender();
  const latestMessage = await ccipReceiver.latestMessage();
  console.log(`CCIP Recevier Contract State
  latestSender: ${latestSender}
  latestMessage: ${latestMessage}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
