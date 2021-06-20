import { randomAddress } from '@enzymefinance/ethers';
import { BasicToken } from '@enzymefinance/example';
import { EthereumTestnetProvider } from '@enzymefinance/hardhat';
import { utils } from 'ethers';

async function snapshot(provider: EthereumTestnetProvider) {
  const someone = await provider.getSignerWithAddress(0);
  const signer = await provider.getSignerWithAddress(1);
  const token = await BasicToken.deploy(signer, utils.parseEther('100'));
  const mock = await BasicToken.mock(signer);

  return {
    mock,
    signer,
    someone,
    token,
  };
}

describe('misc', () => {
  it('toBeProperAddress', async () => {
    const address = randomAddress();
    expect(address).toBeProperAddress();
    expect('0x').not.toBeProperAddress();
  });

  it('toMatchAddress', async () => {
    const a = randomAddress();
    const b = randomAddress();
    expect(a).not.toMatchAddress(b);
    expect(a).toMatchAddress(a);
  });

  it('toMatchParams', async () => {
    const { token, signer } = await provider.snapshot(snapshot);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const params = token.balanceOf.fragment.outputs!;
    const expected = utils.parseEther('100');
    const balance = await token.balanceOf(signer);
    expect([balance]).toMatchParams(params, [expected]);
  });
});
