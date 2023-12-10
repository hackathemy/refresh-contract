const { networks } = require("../networks");

task("faucet-link", `faucet link token to funding contract`)
  .addParam("amount", "faucet amount")
  .setAction(async (taskArgs, hre) => {
    let { amount } = taskArgs;

    console.log(`\n__Selected Network__ : ${network.name}
The network will be used for deploying receiver contract
`);

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
    const linkToken = networks[network.name].linkToken;
    const abi = [
      // check balance
      "function balanceOf(address owner) view returns (uint256)",
      // send token
      "function transfer(address to, uint256 amount) public returns (bool)",
    ];

    const linkTokenContract = new ethers.Contract(linkToken, abi, deployer);

    // 1. check link token balance of our funding contract
    const beforeBalance = await linkTokenContract.balanceOf(fundingAddress);
    console.log(`Current Link Token Balance: ${beforeBalance.toString()}`);

    const weiValue = ethers.utils.parseUnits(amount, "ether"); // 1 ETH를 wei로 변환

    console.log(`Faucet Amount In Wei: ${weiValue}`);
    const tx = await linkTokenContract.transfer(fundingAddress, weiValue);
    console.log(`Success Tx: ${networks[network.name].explorer(tx.hash)}`);

    // 1. check link token balance of our funding contract
    const afterBalance = await linkTokenContract.balanceOf(fundingAddress);
    console.log(`Current Link Token Balance: ${afterBalance.toString()}`);
  });
