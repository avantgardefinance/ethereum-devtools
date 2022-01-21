import { BasicToken } from '@enzymefinance/example';
import { utils } from 'ethers';

import type { EthereumTestnetProvider } from '../src';

async function snapshot(provider: EthereumTestnetProvider) {
  const deployer = await provider.getSignerWithAddress(0);
  const someone = await provider.getSignerWithAddress(1);
  const signer = await provider.getSignerWithAddress(2);
  const token = await BasicToken.deploy(signer, utils.parseEther('100'));

  return {
    deployer,
    signer,
    someone,
    token,
  };
}

fdescribe('functions', () => {
  it('toCostLessThan', async () => {
    const { token, someone } = await provider.snapshot(snapshot);

    const receipt = await token.transfer(someone, '456');

    expect(receipt).toCostLessThan('52200');
  });

  it('toCostBetween', async () => {
    const { token, someone } = await provider.snapshot(snapshot);

    const receipt = await token.transfer(someone, '456');

    expect(receipt).toCostBetween('52100', '521300');
  });

  it('toCostAround', async () => {
    const { token, someone } = await provider.snapshot(snapshot);

    const receipt = await token.transfer(someone, '456');

    expect(receipt).toCostAround('52100', 100);
  });

  it('toMatchFunctionOutput', async () => {
    const { token, signer } = await provider.snapshot(snapshot);

    const result = await token.balanceOf(signer);

    expect(result).toMatchFunctionOutput(token.balanceOf, utils.parseEther('100'));
  });
});
