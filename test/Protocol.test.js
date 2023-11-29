// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage of Hardhat Network's snapshot functionality.
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.

// custom
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test My contract", () => {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployTokenFixture() {
    // Get the Signers here.
    const [owner] = await ethers.getSigners();

    // To deploy our contract, we just have to call ethers.deployContract and await
    // its waitForDeployment() method, which happens once its transaction has been
    // mined.
    const MyProtocol = await ethers.deployContract("MyProtocol");
    const myProtocol = await MyProtocol.deployed();

    // Fixtures can return anything you consider useful for your tests
    return { myProtocol, owner };
  }

  describe("Projects", () => {
    it("Should create and retrieve multiple projects with unique tokens", async function () {
      // setup
      const { myProtocol, owner } = await loadFixture(deployTokenFixture);

      // test data
      const contentURIs = [
        "ipfs://content-1",
        "ipfs://content-2",
        "ipfs://content-3",
      ];
      const tokenNames = ["Token1", "Token2", "Token3"];
      const tokenSymbols = ["T1", "T2", "T3"];

      // testing
      for (let i = 0; i < contentURIs.length; i++) {
        await expect(
          myProtocol.createProject(
            contentURIs[i],
            tokenNames[i],
            tokenSymbols[i],
          ),
        ).to.emit(myProtocol, "ProjectCreated");
      }

      const projectsCount = await myProtocol.getProjectsCount();
      expect(projectsCount).to.equal(contentURIs.length);

      for (let i = 0; i < contentURIs.length; i++) {
        // Get the contentURI of the created project
        const projectContentURI = await myProtocol.getProjectContentURI(i + 1);
        expect(projectContentURI).to.equal(contentURIs[i]);
      }

      for (let i = 0; i < contentURIs.length; i++) {
        const project = await myProtocol.projects(i + 1);
        expect(project.contentIndex).to.equal(i + 1);
        expect(project.projectBuilder).to.equal(owner.address);
        expect(project.contentURI).to.equal(contentURIs[i]);

        // Check if the token address matches the expected value
        const token = await ethers.getContractAt(
          "ProjectToken",
          project.tokenAddress,
        );
        const name = await token.name();
        const symbol = await token.symbol();
        expect(name).to.equal(tokenNames[i]);
        expect(symbol).to.equal(tokenSymbols[i]);

        // Check if the ProjectCreated event has the correct tokenAddress
        await expect(project.tokenAddress).to.equal(token.address);
      }
    });
  });
});
