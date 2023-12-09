require("@nomicfoundation/hardhat-toolbox");
require("./tasks");
const { networks } = require("./networks");

// TODO: Custom
const REPORT_GAS =
  process.env.REPORT_GAS?.toLowerCase() === "true" ? true : false;
const SOLC_SETTINGS = {
  optimizer: {
    enabled: true,
    runs: 1_000,
  },
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.16",
        settings: SOLC_SETTINGS,
      },
    ],
  },
  networks: {
    ...networks,
  },

  // TODO...
  etherscan: {
    // npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    // to get exact network names: npx hardhat verify --list-networks
    apiKey: {
      sepolia: networks.sepolia.verifyApiKey,
      avalancheFujiTestnet: networks.fuji.verifyApiKey,
      polygonMumbai: networks.mumbai.verifyApiKey,
    },
  },
  gasReporter: {
    enabled: REPORT_GAS,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
  contractSizer: {
    runOnCompile: false,
    only: [
      "FunctionsConsumer",
      "AutomatedFunctionsConsumer",
      "FunctionsBillingRegistry",
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./build/cache",
    artifacts: "./build/artifacts",
  },
};
