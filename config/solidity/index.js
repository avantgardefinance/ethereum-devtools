// eslint-disable-next-line @typescript-eslint/no-var-requires
const common = require('@enzymefinance/prettier-config');

module.exports = {
  ...common,
  overrides: [
    {
      files: '*.sol',
      options: {
        bracketSpacing: false,
        printWidth: 99,
        singleQuote: false,
        tabWidth: 4,
        useTabs: false,
      },
    },
  ],
};
