module.exports = {
  globals: {
    'ts-jest': {
      babelConfig: true,
      diagnostics: {
        warnOnly: true,
      },
    },
  },
  preset: '@enzymefinance/hardhat',
  roots: ['<rootDir>/tests'],
  testTimeout: 60000,
};
