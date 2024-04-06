require("@nomicfoundation/hardhat-toolbox");
require("hardhat-contract-sizer");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {},
    goerli: {
      url: "https://goerli.infura.io/v3/" + process.env.INFURA_API_KEY,
      chainId: 5,
      accounts: [
        process.env.PRIVATE_KEY !== undefined
          ? process.env.PRIVATE_KEY
          : "0x1234567890123456789012345678901234567890123456789012345678901234",
      ],
      timeout: 1000000,
    },
    mainnet: {
      url:
        "https://eth-mainnet.g.alchemy.com/v2/" + process.env.ALCHEMY_MAINNET,
      chainId: 1,
      accounts: [process.env.PRIVATE_KEY],
      timeout: 1000000,
    },
    sepolia: {
      url:
        "https://eth-sepolia.g.alchemy.com/v2/" + process.env.ALCHEMY_SEPOLIA,
      chainId: 11155111,
      accounts: [process.env.PRIVATE_KEY],
      timeout: 1000000,
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    },
  },
  etherscan: {
    apiKey: {
      mainnet:
        process.env.ETHERSCAN_API_KEY !== undefined
          ? process.env.ETHERSCAN_API_KEY
          : "",
      sepolia:
        process.env.ETHERSCAN_API_KEY !== undefined
          ? process.env.ETHERSCAN_API_KEY
          : "",
      base:
        process.env.BASESCAN_API_KEY !== undefined
          ? process.env.BASESCAN_API_KEY
          : "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
};
