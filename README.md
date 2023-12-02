# Hackathemy Protocol Contracts

## Setup Envs
```bash
# shortcut for 'npx hardhat ...'
npm install --global hardhat-shorthand
```

## Workflow
```bash
# 0. listing available task list in this protocol
hh 

# 1. setup receiver contract in polygon 
hh setup-receiver --network mumbai

# 2. setup sender contract in each other chains, (ex: ethereum, avalanche, bnb ...) 
hh setup-send --all true

# 3. faucet at each chains

# 4. transferccip

# 5. polygon
```

## Memo
```bash
# how to compile contracts with hardhat
hh compile

# how to run script file in scripts directory
hh run scripts/deploy.js --network <chain-name in networks>

# verify contract
hh verify --network sepolia <deployed-contract-address> <arg1 arg2 ...>
```