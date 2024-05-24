# Hackathemy Protocol Contracts

## Setup Dev Envs

```bash
# shortcut for 'npx hardhat ...'
npm install --global hardhat-shorthand

# Add extension for hardhat frame development
https://marketplace.visualstudio.com/items?itemName=NomicFoundation.hardhat-solidity
# Please visit here, https://hardhat.org/hardhat-runner/plugins If you want to more dev plugins for hardhat dev
```

## Available Tasks

```
AVAILABLE TASKS:

  setup-receiver        Deploy RefreshProtocol(receiver) contract on the network which you select by --network flag
  add-project           Add a sample project on our protocol contract in polygon mumbai
  check-project         Check a created sample project on our protocol contract in polygon mumbai

  setup-sender-all      Deploy RefreshFunding(sender) contract in each network without polygon chain
  setup-sender          Deploy RefreshFunding(sender) contract on the network which you select by --network flag

  faucet-link           Drip link token to our funding contract in source chain
  approve-token         Approve BnM token to transferFrom funding contract in source chain
  check-allowance       Check allowance amount for funding contract in source chain
  fund-with-ccip        Fund a project from source chain to destination chain by using CCIP
```

## Workflow

```bash
# 0. listing available task list in this protocol
hh

# 1. setup receiver contract in polygon
hh setup-receiver --network mumbai

# 2. setup project which will be funded from source chain
hh add-project --network mumbai

# 2. check setup project
hh check-project --network mumbai

# 4. setup sender contract in each other chains, (ex: ethereum, avalanche, bnb ...)
hh setup-sender --network fuji
hh setup-sender --network bnb
hh setup-sender --network optimism
hh setup-sender --network sepolia

# 5. drip link token to funding contract for CCIP fees
hh faucet-link --network fuji --amount <link token amount>

# 6. approve erc20 token for project funding
hh approve-token --amount <bnm token amount> --network fuji

# 7. check allowance approved amount
hh check-allowance --network fuji

# 8. fund with CCIP
hh fund-with-ccip  --amount <approved bnm token amount> --network fuji
```

## Memo

```bash
# how to work CCIP in deep dive level
https://github.com/smartcontractkit/ccip/blob/ccip-develop/contracts/src/v0.8/ccip/offRamp/EVM2EVMOffRamp.sol#L248C15-L248C15
https://ethereum.stackexchange.com/questions/156200/when-testing-chainlink-ccip-with-router-sol-what-address-should-the-onramp-be

# how to use ethers abi abstract
https://docs.ethers.org/v5/api/contract/example/

# how to activate local node for dev
hh node

# how to compile contracts with hardhat
hh compile

# how to run script file in scripts directory
hh run scripts/deploy.js --network <chain-name in networks>

# verify contract
hh verify --network sepolia <deployed-contract-address> <arg1 arg2 ...>
# sample for source chain
hh verify --network sepolia <deployed contract address> <router addrees> <link token address>
# sample for destination chain
hh verify --network mumbai <deployed contract address> <router address> <zkverifier address>
```

## References

- hardhat framework
  - https://hardhat.org/tutorial/testing-contracts
  - https://github.com/ahmedali8/hardhat-js-starterkit
  - https://github.com/RohitKS7/hardhat-dao-fcc
- chainlink CCIP
  - https://github.com/smartcontractkit/ccip-starter-kit-hardhat
  - https://docs.chain.link/ccip/tutorials/cross-chain-tokens
  - https://github.com/smartcontractkit/ccip-defi-lending
