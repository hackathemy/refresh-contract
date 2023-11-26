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
```