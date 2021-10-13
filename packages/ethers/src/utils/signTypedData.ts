import type { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import type { providers } from 'ethers';
import { utils } from 'ethers';

import { typedDataPayload } from './typedDataPayload';

export async function signTypedData(
  provider: providers.JsonRpcProvider,
  address: string,
  domain: TypedDataDomain,
  types: Record<string, Array<TypedDataField>>,
  value: Record<string, any>,
): Promise<{ signature?: string; method?: string; cancelled?: boolean }> {
  const payload = await typedDataPayload(provider, domain, types, value);

  // WalletConnect needs to use `eth_signTypedData`.
  // WalletConnect wallets may not know about `eth_signTypedData_v4`.
  try {
    const method = 'eth_signTypedData';
    const signature = await provider.send(method, [address.toLowerCase(), payload]);

    return { method, signature };
  } catch (error) {
    if (typeof error === 'string' && error.endsWith('User denied message signature.')) {
      return { cancelled: true };
    }
  }

  // MetaMask needs to use `eth_signTypedData_v4`.
  // MetaMask has implemented `eth_signTypedData` as `eth_signTypedData_v1`.
  try {
    const method = 'eth_signTypedData_v4';
    const signature = await provider.send(method, [address.toLowerCase(), payload]);

    return { method, signature };
  } catch (error) {
    if (typeof error === 'object' && (error as any)?.code === 4001) {
      return { cancelled: true };
    }
  }

  // Gnosis Safe doesn't support `eth_signTypedData_v4` or `eth_signTypedData` yet
  try {
    const method = 'eth_sign';
    const signature = await provider.send(method, [address.toLowerCase(), utils.hexlify(utils.toUtf8Bytes(payload))]);

    return { method, signature };
  } catch (error) {
    if (typeof error === 'string' && error.startsWith('Error: Transaction was rejected')) {
      return { cancelled: true };
    }
  }

  return {};
}
