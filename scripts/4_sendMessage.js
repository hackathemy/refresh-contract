const hre = require("hardhat");

async function main() {
  const ccipSenderAddress = `0x55529D0CA12e2C04EaC46A1195d175Bf098Fc024`;
  const ccipReceiverAddress = `0x7B5727Ca11432A5c8150C45291EE34225B674A1B`;
  const someText = `CCIP Test`;
  const destinationChainSelector = 12532609583862916517n;

  // build contract factory & deploy
  const ccipSenderFactory =
    await hre.ethers.getContractFactory("CCIPSender_Unsafe"); // with signer
  const ccipSender = await ccipSenderFactory.attach(ccipSenderAddress);

  const tx = await ccipSender.send(
    ccipReceiverAddress,
    someText,
    destinationChainSelector,
  );

  await tx.wait();
  console.log(`Transaction hash: ${tx.hash}`);
  console.log(`Explorer: https://ccip.chain.link/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
