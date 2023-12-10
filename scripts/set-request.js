async function main() {
  const circuitId = "credentialAtomicQuerySig";
  const validatorAddress = "0xb1e86C4c687B85520eF4fd2a0d14e81970a15aFB";

  // const schemaHash = "6ebc2e19a4280fd84d76242eaa99cec6" // extracted from PID Platform
  const schemaHash = "378dbe7720bda549e7ec9bd041a95511"; // extracted from PID Platform
  const schemaEnd = fromLittleEndian(hexToBytes(schemaHash));

  const query = {
    schema: ethers.BigNumber.from(schemaEnd),
    slotIndex: 2,
    operator: 3,
    value: [18, ...new Array(63).fill(0).map((i) => 0)],
    circuitId,
  };

  // add the address of the contract just deployed
  // ERC20VerifierAddress = "0x4c59E9685CCa9F9Ef71663840cB5F95287d25958";
  ERC20VerifierAddress = "0x644bD19a51aa84e3d7decf0Dc17e35554fA017B6";

  let erc20Verifier = await hre.ethers.getContractAt(
    "RefreshProtocol",
    ERC20VerifierAddress,
  );

  try {
    await erc20Verifier.setZKPRequest(1, validatorAddress, query);
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
