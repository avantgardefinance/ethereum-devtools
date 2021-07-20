const coverage = JSON.parse(process.env.COVERAGE || 'false');

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
  testEnvironmentOptions: {
    coverage,
  },
  testTimeout: 60000,
};
