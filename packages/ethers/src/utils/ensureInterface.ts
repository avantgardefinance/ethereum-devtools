import type { Fragment, JsonFragment } from '@ethersproject/abi';
import { Interface } from '@ethersproject/abi';

export type PossibleInterface = string | (Fragment | JsonFragment | string)[];
export function ensureInterface(abi: Interface | PossibleInterface) {
  if (Interface.isInterface(abi)) {
    return abi;
  }

  return new Interface(abi);
}
