import '@enzymefinance/hardhat/plugin';

import type { HardhatUserConfig } from 'hardhat/types';

const config: HardhatUserConfig = {
  codeCoverage: {
    path: './cache/coverage',
  },
  codeGenerator: {
    abi: {
      path: './src/abi',
    },
    bytecode: {
      path: './src/bytecode',
    },
    clear: true,
    enabled: true,
    typescript: {
      path: './src/codegen',
    },
  },
  networks: {
    hardhat: {
      accounts: {
        count: 10,
        mnemonic: 'test test test test test test test test test test test junk',
      },
      gas: 9500000,
      loggingEnabled: true,
    },
  },
  solidity: {
    settings: {
      optimizer: {
        details: {
          yul: false,
        },
        enabled: true,
        runs: 200,
      },
    },
    version: '0.6.12',
  },
};

export default config;
