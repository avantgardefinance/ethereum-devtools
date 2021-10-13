import type { providers } from 'ethers';
import { utils } from 'ethers';

import type { AddressLike } from '../types';

export async function isContract(provider: providers.Provider, address: AddressLike): Promise<boolean> {
  const bytecode = await provider.getCode(address.toString());
  return !!(bytecode && utils.hexStripZeros(bytecode) !== '0x');
}
