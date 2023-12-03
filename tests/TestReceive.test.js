const { expect } = require("chai");
const { ethers } = require("hardhat");

// Contract
describe("TestReceive", function () {
  it("CCIP Receive Message Testing", async function () {
    // deploy test
    const TestReceive = await ethers.getContractFactory("TestReceive");
    const ProjectToken = await ethers.getContractFactory("ProjectToken");

    const testReceive = await TestReceive.deploy();
    await testReceive.deployed();

    const tx = await testReceive.ccipReceive();
    await tx.wait();

    const testToken = await testReceive.projects(1);
    console.log(`test erc20 token address: ${testToken.tokenAddress}`);

    const balanceOfFunder = await ProjectToken.attach(
      testToken.tokenAddress,
    ).balanceOf("0xa0DBD950C5E6F768968135Ab4c055936D5f16CDD");

    expect(balanceOfFunder).to.equal("100");
  });
});
