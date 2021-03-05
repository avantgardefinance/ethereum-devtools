require('@enzymefinance/hardhat/plugin/compile');
require('@enzymefinance/hardhat/plugin/coverage');

module.exports = {
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
      // loggingEnabled: true,
      gas: 9500000,
    },
  },
  solidity: {
    version: '0.6.12',
  },
};
