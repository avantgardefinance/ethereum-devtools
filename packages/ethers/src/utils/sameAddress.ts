import { AddressLike } from '../types';
import { resolveAddress } from './resolveAddress';

export function sameAddress(a: AddressLike, b: AddressLike) {
  return resolveAddress(a) === resolveAddress(b);
}
