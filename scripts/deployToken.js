const { link } = require("fs");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // const token = await ethers.deployContract("Token");
  const senderFactory = await ethers.getContractFactory("Sender");

  const routerAddress = "0xD0daae2231E9CB96b94C8512223533293C3693Bf";
  const linkAddress = "0x779877A7B0D9E8603169DdbD7836e478b4624789";

  const sender = await senderFactory.deploy(routerAddress, linkAddress);

  // console.log("Token address:", await token.getAddress());
  console.log("CCIP Sender address:", await sender.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
