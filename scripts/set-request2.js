async function main() {
  const circuitId = "credentialAtomicQuerySig";
  const validatorAddress = "0x1E4a22540E293C0e5E8c33DAfd6f523889cFd878";

  const requestId = 1701840378;
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
  ERC20VerifierAddress = "0xa375CC86fB995cDd642402f2a74b294F74c8d608";

  let erc20Verifier = await hre.ethers.getContractAt(
    "ERC20Verifier",
    ERC20VerifierAddress,
  );

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
