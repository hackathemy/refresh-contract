const { expect } = require("chai");
const { ethers } = require("hardhat");

// Contract
describe("Encode", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Contract = await ethers.getContractFactory("Encode");
    const contract = await Contract.deploy();
    await contract.deployed();

    const encodedMessage = ethers.utils.formatBytes32String("Hello, Solidity!");
    console.log("test message", encodedMessage);

    const temp = await contract.encode("Hello, Solidity!");
    console.log(temp);

    // const decodedString = await testReceive.decodeString(encodedMessage);
  });
});
