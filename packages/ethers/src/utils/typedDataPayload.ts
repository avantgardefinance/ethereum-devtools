import type { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer';
import type { providers } from 'ethers';
import { utils } from 'ethers';

export async function typedDataPayload(
  provider: providers.JsonRpcProvider,
  domain: TypedDataDomain,
  types: Record<string, Array<TypedDataField>>,
  value: Record<string, any>,
) {
  const populated = await utils._TypedDataEncoder.resolveNames(domain, types, value, (name: string) => {
    return provider.resolveName(name);
  });

  return JSON.stringify(utils._TypedDataEncoder.getPayload(populated.domain, types, populated.value));
}
