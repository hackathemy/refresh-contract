const path = require("path");
const envPath = path.join(__dirname, "./.env");

require("dotenv").config({ path: envPath });
require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHEREUM_SEPOLIA_RPC_URL = process.env.ETHEREUM_SEPOLIA_RPC_URL;
const AVALANCHE_FUJI_RPC_URL = process.env.AVALANCHE_FUJI_RPC_URL;
const POLYGON_MUMBAI_RPC_URL = process.env.POLYGON_MUMBAI_RPC_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    ethereumSepolia: {
      url: ETHEREUM_SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      gas: 3000000,
    },
    polygonMumbai: {
      url: POLYGON_MUMBAI_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    avalancheFuji: {
      url: AVALANCHE_FUJI_RPC_URL,
      accounts: [PRIVATE_KEY],
      gas: 6000000,
    },
  },
};
