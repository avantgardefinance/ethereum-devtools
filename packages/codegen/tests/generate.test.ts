import { utils } from 'ethers';
import path from 'path';

import { generateContract } from '../src/generate';
import { formatOutput } from '../src/utils';

describe('code generator', () => {
  it('generates code for solidity artifacts', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const contract = require('./__fixtures__/artifact.json');
    const source = require.resolve('./__fixtures__/artifact.json');
    const destination = path.resolve(__dirname, 'ERC20.ts');

    let relative = path.relative(path.dirname(destination), source);
    if (!relative.startsWith('.')) {
      relative = `./${relative}`;
    }

    const abi = new utils.Interface(contract.abi);
    const output = generateContract('ERC20', relative, abi);
    const formatted = formatOutput(output);

    expect(formatted).toMatchSnapshot();
  });
});
