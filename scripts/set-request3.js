const { ethers, run } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();

  console.log("Deploying contracts with the account:", deployer.address);

  // convert a currency unit from wei to ether
  const balanceInEth = ethers.utils.formatEther(balance);
  console.log(`Account balance: ${balanceInEth} ETH`);

  const circuitId = "credentialAtomicQuerySig";
  const validatorAddress = "0x1E4a22540E293C0e5E8c33DAfd6f523889cFd878";

  const requestId = 1;
  const schemaHash = "2c604bb2aa44049114b89d029ecc5b24";
  const schemaEnd = fromLittleEndian(hexToBytes(schemaHash));

  const query = {
    schema: ethers.BigNumber.from(schemaEnd),
    slotIndex: 2,
    operator: 1,
    value: [1, ...new Array(63).fill(0).map((i) => 0)], // for operators 1,2,3,6 only first value matters
    circuitId,
  };

  // add the address of the contract just deployed
  const ERC20VerifierAddress = "0x644bD19a51aa84e3d7decf0Dc17e35554fA017B6";
  // build contract factory & deploy
  const erc20VerifierFactory =
    await hre.ethers.getContractFactory("RefreshProtocol"); // with signer
  const erc20Verifier = await erc20VerifierFactory.attach(ERC20VerifierAddress);

  try {
    await erc20Verifier.setZKPRequest(requestId, validatorAddress, query);
    console.log("Request set");
  } catch (e) {
    console.log("error: ", e);
  }
}

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

function fromLittleEndian(bytes) {
  const n256 = BigInt(256);
  let result = BigInt(0);
  let base = BigInt(1);
  bytes.forEach((byte) => {
    result += base * BigInt(byte);
    base = base * n256;
  });
  return result;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
