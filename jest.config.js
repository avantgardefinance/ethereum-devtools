// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

function common(package) {
  return {
    displayName: package.split('/')[1],
    globals: {
      'ts-jest': {
        babelConfig: true,
        diagnostics: {
          warnOnly: true,
        },
      },
    },
    rootDir: path.dirname(require.resolve(`${package}/package.json`)),
    roots: ['<rootDir>/tests'],
  };
}

module.exports = {
  projects: [
    {
      ...common('@enzymefinance/codegen'),
      preset: 'ts-jest',
    },
    {
      ...common('@enzymefinance/ethers'),
      preset: '@enzymefinance/hardhat',
    },
    {
      ...common('@enzymefinance/hardhat'),
      preset: '@enzymefinance/hardhat',
      testEnvironmentOptions: {
        hardhatNetworkOptions: {
          allowUnlimitedContractSize: true,
        },
        hardhatTestOptions: {
          coverage: true,
        },
      },
    },
  ],
  testTimeout: 60000,
};
