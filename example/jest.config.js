const coverage = JSON.parse(process.env.COVERAGE || 'false');

module.exports = {
  preset: '@enzymefinance/hardhat',
  roots: ['<rootDir>/tests'],
  testEnvironmentOptions: {
    coverage,
  },
  testTimeout: 60000,
};
