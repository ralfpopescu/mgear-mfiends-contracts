import * as dotenv from "dotenv";

import { extendEnvironment, HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const deployedAddresses = {
  rinkeby: {
    mineablePunks: "0xC81125bFcE6Db171010A007530940aE75e259634",
    mineableWords: "0xA9714Cd285168596cCBb39b535C0C628fc6C2B09",
    mgearRenderer: "0xBf3118AbF6EfFe1ff69Bd9f0bD00Bc0e492Fc99B",
    mgear: "0xCf448c8a0D544A7D9B2d77f48090f31248073afd",
    targetGasPrice: "70",
  },
  mainnet: {
    mineablePunks: "0x595a8974c1473717c4b5d456350cd594d9bda687",
    mineableWords: "0x05fe017770d0ca164736537177e1d571d16bbade",
    mgearRenderer: "0x5D8A3aB1096297B99eC4FEEA43ebc2EF44CCb51a",
    mgearv1: "0x65b394366af4683903077E369603d388193950e2",
    mgearv2: "",
    targetGasPrice: "55",
  },
  hardhat: {
    mineableWords: "0x05fe017770d0ca164736537177e1d571d16bbade",
    lendingPool: "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9",
    wethGateway: "0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04",
    mwordsOwnerAddr: "0x1adc7297fd937bb76ee914c0002804102f3e4248",
  },
  localhost: {
    mineableWords: "0x05fe017770d0ca164736537177e1d571d16bbade",
    lendingPool: "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9",
    wethGateway: "0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04",
    mwordsOwnerAddr: "0x1adc7297fd937bb76ee914c0002804102f3e4248",
    mwordsWithdraw: "0x0f22bB78278A1AF056DFdd6b3224E56dBd560BD8",
    targetGasPrice: "50",
  },
};

extendEnvironment((hre) => {
  // @ts-ignore
  hre.deployedAddresses = deployedAddresses[hre.network.name];
});

const config: HardhatUserConfig = {
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1340,
    },
    localhost: {
      chainId: 1340,
    },
    rinkeby: {
      url: process.env.RINKEBY_URL,
      accounts: [process.env.RINKEBY_ACCOUNT],
    },
    ropsten: {
      url: process.env.ROPSTEN_URL,
      accounts: [process.env.ROPSTEN_ACCOUNT],
    },
    mainnet: {
      url: process.env.MAINNET_URL,
      accounts: [process.env.MAINNET_ACCOUNT],
    },
    goerli: {
      url: process.env.GOERLI_URL,
      accounts: [process.env.GOERLI_ACCOUNT],
    },
  },
  gasReporter: {
    enabled: true,
    currency: "ETH",
  },
  mocha: {
    timeout: 99999999999999,
  },
};

export default config;
