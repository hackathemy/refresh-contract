const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenReceiverContract", function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy a mock ERC-20 token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy(
      "MockToken",
      "MTK",
      ethers.utils.parseEther("1000000"),
    );
    await mockToken.deployed();

    // Deploy a TokenReceiver Contarct
    const TokenReceiverContract = await ethers.getContractFactory(
      "TokenReceiverContract",
    );
    const tokenReceiverContract = await TokenReceiverContract.deploy(
      mockToken.address,
    );
    await tokenReceiverContract.deployed();

    // Fixtures can return anything you consider useful for your tests
    return { mockToken, tokenReceiverContract, owner, addr1, addr2 };
  }

  it("should receive tokens and allow contract to use them", async function () {
    // setup by using loadFixture
    const { mockToken, tokenReceiverContract, owner, addr1, addr2 } =
      await loadFixture(deployTokenFixture);

    console.log("mockToken Address", mockToken.address);
    // check init balance
    let ownerBalanceBefore = await mockToken.balanceOf(owner.address);
    let addr1BalanceBefore = await mockToken.balanceOf(addr1.address);
    console.log(
      `owner has: ${ethers.BigNumber.from(ownerBalanceBefore).toString()}`,
    );
    console.log(
      `addr1 has: ${ethers.BigNumber.from(addr1BalanceBefore).toString()}`,
    );

    const mockTokenAddress = await tokenReceiverContract.token();
    console.log("Receiver Contract Token Getter", mockTokenAddress);

    // same logic
    await tokenReceiverContract.connect(owner).receiveTokens(100);

    // Call the receiveTokens function to transfer 100 tokens from the sender to TokenReceiverContract
    // await tokenReceiverContract.connect(owner).receiveTokens(100);

    // Check the balance of TokenReceiverContract after the transfer
    // const contractBalance = await mockToken.balanceOf(
    //   tokenReceiverContract.address,
    // );
    // expect(contractBalance).to.equal(ethers.utils.parseEther("100"));
  });
});
