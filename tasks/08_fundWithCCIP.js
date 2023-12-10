const { networks } = require("../networks");
const contractName = "RefreshFunding";

task("fund-with-ccip", `funding with CCIP`)
  .addParam("amount", "funding amount")
  .setAction(async (taskArgs, hre) => {
    console.log(`\n__Selected Network__ : ${network.name}
The network will be used for deploying receiver contract
`);
    let { amount } = taskArgs;

    console.log(amount);

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
    const PROTOCOL_ADDRESS = networks["mumbai"].protocol;
    // check contract's link balance

    // Get the balance of the ERC-20 token at the specified timestamp
    const fundingFactory = await ethers.getContractFactory(contractName);
    const funding = await fundingFactory.attach(fundingAddress);

    console.log(`Refresh Funding Address: ${fundingAddress}`);
    console.log(`Refresh Protocol Address: ${PROTOCOL_ADDRESS}`);
    const tx = await funding.sendMessagePayLINK(
      PROTOCOL_ADDRESS, // receive address = polygon protocol address
      1, // project index
      tokenAddress, // token
      amount, // amount
    );

    // 트랜잭션이 마이닝되고 블록에 포함될 때까지 대기
    const receipt = await tx.wait();
    console.log("Transaction Hash:", receipt.transactionHash);
    console.log(`${networks[network.name].explorer(tx.hash)}`);

    const events = receipt.events;
    events.forEach((event) => {
      if (event.event === "MessageSent") {
        const messageId = event.messageId;

        console.log(`Send Message ID: ${messageId}`);
        console.log(`https://ccip.chain.link/msg/${messageId}`);
      }
    });
  });
