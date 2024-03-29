import { constants, utils } from 'ethers';

import { randomAddress } from '../src';
import { Token } from './construction.test';

describe('mocking', () => {
  it('properly deploys the mock contract', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const mock = await Token.mock(signer);

    expect(mock.address).toMatch(/^0x[0-9-a-fA-F]{40}$/);
  });

  it('can mock contract return values', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const token = await Token.mock(signer);

    await token.balanceOf.returns(123);
    const result = await token.balanceOf(constants.AddressZero);

    expect(result.toString()).toBe('123');
  });

  it('can mock contract return values with arguments', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const token = await Token.mock(signer);
    const specificAddress = randomAddress();

    await token.balanceOf.returns(123);
    await token.balanceOf.given(specificAddress).returns(456);

    const generic = await token.balanceOf(randomAddress());
    const specific = await token.balanceOf(specificAddress);

    expect(generic.toString()).toBe('123');
    expect(specific.toString()).toBe('456');
  });

  it('can mock reverts', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const mock = await Token.mock(signer);

    await mock.balanceOf.given(constants.AddressZero).reverts('YOU SHALL NOT PASS!');

    await expect(mock.balanceOf(constants.AddressZero)).rejects.toThrowError('Mock revert: YOU SHALL NOT PASS!');
  });

  it('reverts with function signature on missing mock', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const mock = await Token.mock(signer);

    await expect(mock.balanceOf(constants.AddressZero)).rejects.toThrowError(
      'Mock not initialized: balanceOf(address)',
    );
  });

  it('can forward calls', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const token = await Token.deploy(signer);
    const mock = await Token.mock(signer);

    await expect(mock.forward(token.name)).resolves.toBe('Basic');
  });

  it('can forward sends', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const token = await Token.deploy(signer);
    const mock = await Token.mock(signer);

    const spender = randomAddress();
    const amount = utils.parseEther('1');

    await expect(mock.forward(token.approve, spender, amount)).resolves.toMatchObject({
      transactionHash: expect.anything(),
      transactionIndex: expect.anything(),
    });
  });

  it('can reset previously set mocks', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const token = await Token.mock(signer);

    let result;

    await token.balanceOf.returns(123);
    result = await token.balanceOf(constants.AddressZero);
    expect(result.toString()).toBe('123');

    await token.balanceOf.reset();
    result = token.balanceOf(constants.AddressZero);
    await expect(result).rejects.toThrowError('Mock not initialized: balanceOf(address)');
  });

  it('can reset previously set mocks with specific args', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const token = await Token.mock(signer);

    let result;

    await token.balanceOf.returns(123);
    result = await token.balanceOf(constants.AddressZero);
    expect(result.toString()).toBe('123');

    await token.balanceOf.given(constants.AddressZero).returns(456);
    result = await token.balanceOf(constants.AddressZero);
    expect(result.toString()).toBe('456');

    await token.balanceOf.given(constants.AddressZero).reset();
    result = await token.balanceOf(constants.AddressZero);
    expect(result.toString()).toBe('123');

    await token.balanceOf.reset();
    result = token.balanceOf(constants.AddressZero);
    await expect(result).rejects.toThrowError('Mock not initialized: balanceOf(address)');
  });
});
