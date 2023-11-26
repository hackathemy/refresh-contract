const { networks } = require("../networks");
const contractName = "CCIPSender_Custom";

/**
 * npx hardhat task...
 * @param1 task name (example: in this code, task name is "setup-sender")
 * @param2 task description (example: in this code, task description is "deploy Sender.sol")
 *
 * @flag --all means ..
 */
task(
  "setup-sender",
  "deploy sender contract in each network without polygon chain",
)
  .addParam("all", "address of CCIP contract to read")
  .setAction(async (taskArgs, hre) => {
    let { all } = taskArgs;

    if (all !== "true" && all !== "false") {
      console.error(
        `ERROR) --all is only accepted bool type string, your input is ${all}`,
      );
      process.exit(1);
    }

    // let isAll = Boolean(all);
    for (const network in networks) {
      // skip mumbai
      if (network === "mumbai") {
        continue;
      }

      // TODO: change for all network loop
      if (network === "hardhat") {
        console.log(`__CAUTION!__\nYOU'RE IN THE TEST HARDHAT NETWORK`);
        await hre.run("depoly-sender", { networkName: network });
      }
    }
  });

// https://hardhat.org/hardhat-runner/docs/advanced/create-task
subtask("depoly-sender", "Prints a message for depoly-sender subtask")
  .addParam("networkName", "The name for selected network in subtask")
  .setAction(async (taskArgs) => {
    const networkName = taskArgs.networkName;

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

    // TODO: we change to simulate our user work flow
    console.log(`\n__Compiling Contracts__ : ${contractName}`);
    await run("compile");

    const contractFactory = await ethers.getContractFactory(contractName);
    const contract = await contractFactory.deploy(ROUTER, LINK);
    await contract.deployTransaction.wait(1);

    console.log(`\n__Deploying Contract__ : ${contractName}.sol`);
    console.log(`${contractName} deployed to ${contract.address}`);

    // Fund with CCIP BnM Token
    const TOKEN_TRANSFER_AMOUNT = "0.0001";
    const LINK_AMOUNT = "0.5";
    console.log(
      `\nFunding ${contract.address} with ${TOKEN_TRANSFER_AMOUNT} CCIP-BnM `,
    );

    // const bnmTokenContract = await ethers.getContractAt(
    //   "@chainlink/contracts/src/v0.4/interfaces/ERC20.sol:ERC20",
    //   bnmToken,
    // );
    // const bnmTokenTx = await bnmTokenContract.transfer(
    //   senderContract.address,
    //   ethers.utils.parseUnits(TOKEN_TRANSFER_AMOUNT),
    // );
    // await bnmTokenTx.wait(1);
    // const bnmTokenBal_baseUnits = await bnmTokenContract.balanceOf(
    //   senderContract.address,
    // );
    // const bnmTokenBal = ethers.utils.formatUnits(
    //   bnmTokenBal_baseUnits.toString(),
    // );
    // console.log(
    //   `\nFunded ${senderContract.address} with ${bnmTokenBal} CCIP-BnM`,
    // );
    // // Fund with LINK
    // console.log(`\nFunding ${senderContract.address} with ${LINK_AMOUNT} LINK `);
    // const LinkTokenFactory = await ethers.getContractFactory("LinkToken");
    // const linkTokenContract = await LinkTokenFactory.attach(
    //   networks[network.name].linkToken,
    // );
    // const linkTx = await linkTokenContract.transfer(
    //   senderContract.address,
    //   ethers.utils.parseUnits(LINK_AMOUNT),
    // );
    // await linkTx.wait(1);
    // const juelsBalance = await linkTokenContract.balanceOf(
    //   senderContract.address,
    // );
    // const linkBalance = ethers.utils.formatEther(juelsBalance.toString());
    // console.log(`\nFunded ${senderContract.address} with ${linkBalance} LINK`);
  });
