// All supported networks and related contract addresses are defined here.
//
// LINK token addresses: https://docs.chain.link/resources/link-token-contracts/
// Price feeds addresses: https://docs.chain.link/data-feeds/price-feeds/addresses
// Chain IDs: https://chainlist.org/?testnets=true

// require("@chainlink/env-enc").config(".env");
const path = require("path");
const envPath = path.join(__dirname, "./.env");
require("dotenv").config({ path: envPath });

const DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS = 2;
const npmCommand = process.env.npm_lifecycle_event;
const isTestEnvironment = npmCommand == "test" || npmCommand == "test:unit";

// Set EVM private key (required)
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!isTestEnvironment && !PRIVATE_KEY) {
  throw Error(
    "Set the PRIVATE_KEY environment variable with your EVM wallet private key",
  );
}

const networks = {
  hardhat: {
    allowUnlimitedContractSize: true,
    // accounts: process.env.PRIVATE_KEY
    //   ? [
    //       {
    //         privateKey: process.env.PRIVATE_KEY,
    //         balance: "10000000000000000000000",
    //       },
    //     ]
    //   : [],
    // copied by fuji
    router: "0x554472a2720e5e7d5d3c817529aba05eed5f82d8",
    chainSelector: "14767482510784806043",
    nativeCurrencySymbol: "ETH",
    linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    bnmToken: "0xd21341536c5cf5eb1bcb58f6723ce26e8d8e90e4",
    explorer: (txHash) => {
      return `https://testnet.snowtrace.io/tx/${txHash}`;
    },
  },
  sepolia: {
    url: process.env.ETHEREUM_SEPOLIA_RPC_URL || "THIS HAS NOT BEEN SET",
    gasPrice: undefined,
    router: "0xd0daae2231e9cb96b94c8512223533293c3693bf",
    chainSelector: "16015286601757825753",
    accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    verifyApiKey: process.env.ETHEREUM_SEPOLIA_VERIFY_API_KEY || "",
    chainId: 11155111,
    confirmations: DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "ETH",
    linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    bnmToken: "0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05", // LINK/SEPOLIA-ETH
    explorer: (txHash) => {
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    },
  },
  fuji: {
    url: process.env.AVALANCHE_FUJI_RPC_URL || "THIS HAS NOT BEEN SET",
    router: "0x554472a2720e5e7d5d3c817529aba05eed5f82d8",
    chainSelector: "14767482510784806043",
    accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    verifyApiKey: "snowtrace", // not required
    chainId: 43113,
    nativeCurrencySymbol: "AVAX",
    linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    bnmToken: "0xd21341536c5cf5eb1bcb58f6723ce26e8d8e90e4",
    explorer: (txHash) => {
      return `https://testnet.snowtrace.io/tx/${txHash}`;
    },
  },
  mumbai: {
    url: process.env.POLYGON_MUMBAI_RPC_URL || "THIS HAS NOT BEEN SET",
    router: "0x70499c328e1e2a3c41108bd3730f6670a44595d1",
    chainSelector: "14767482510784806043",
    gasPrice: undefined,
    accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    verifyApiKey:
      process.env.POLYGON_MUMBAI_VERIFY_API_KEY || "THIS HAS NOT BEEN SET",
    chainId: 80001,
    confirmations: 2 * DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "MATIC",
    linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    bnmToken: "0xd21341536c5cf5eb1bcb58f6723ce26e8d8e90e4",
    explorer: (txHash) => {
      return `https://mumbai.polygonscan.com/tx/${txHash}`;
    },
  },
  bnb: {
    url: process.env.BNB_TESTNET_RPC_URL || "THIS HAS NOT BEEN SET",
    router: "0x9527e2d01a3064ef6b50c1da1c0cc523803bcff2",
    chainSelector: "13264668187771770619",
    gasPrice: undefined,
    accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    verifyApiKey:
      process.env.POLYGON_MUMBAI_VERIFY_API_KEY || "THIS HAS NOT BEEN SET",
    chainId: 97,
    confirmations: 2 * DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "tBNB",
    linkToken: "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06",
    bnmToken: "0xbfa2acd33ed6eec0ed3cc06bf1ac38d22b36b9e9",
    explorer: (txHash) => {
      return `https://testnet.bscscan.com/tx/${txHash}`;
    },
  },
};

module.exports = {
  networks,
};
