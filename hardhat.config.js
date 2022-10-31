require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-web3");
require("hardhat-gas-reporter");
require("solidity-coverage");
require('@openzeppelin/hardhat-upgrades');
require("dotenv").config({ path: ".env" });
require("@nomiclabs/hardhat-ethers");

const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || "https://polygontestapi.terminet.io/rpc"
const BSCTESTNET_RPC_URL = process.env.BSCTESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545"

const PRIVATE_KEY = process.env.PRIVATE_KEY;


module.exports = {
  solidity: "0.8.10",
  gasReporter: {
    enabled: process.env.REPORT_GAS
  },

  allowUnlimitedContractSize: true,
  networks: {
    hardhat: {},
    bscTestnet: {
      url: BSCTESTNET_RPC_URL, 
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [PRIVATE_KEY],
    },    
    mumbai: {
      url: MUMBAI_RPC_URL,
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
    },    
  },
};
