import type { AddressLike } from '../types';
import { resolveAddress } from './resolveAddress';

export function sameAddress(a: AddressLike, b: AddressLike) {
  return resolveAddress(a) === resolveAddress(b);
}

export function safeSameAddress(a: AddressLike | null | undefined, b: AddressLike | null | undefined) {
  try {
    // Potentially also do more checks on the inputs and not just for truthyness?
    return a && b && sameAddress(a, b);
  } catch {}

  return false;
}
