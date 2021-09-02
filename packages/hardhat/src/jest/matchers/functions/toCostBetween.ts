import type { BigNumberish } from 'ethers';
import { matcherHint } from 'jest-matcher-utils';

import { forcePass, isTransactionReceipt } from '../../utils';
import { ensureBigNumbers } from '../bn/utils';
import { ignoreGasMatchers } from './common/ignoreGasMatchers';

export function toCostBetween(this: jest.MatcherContext, received: any, min: BigNumberish, max: BigNumberish) {
  if (ignoreGasMatchers) {
    return forcePass(this.isNot);
  }

  if (!isTransactionReceipt(received)) {
    throw new Error('The received value is not a transaction receipt');
  }

  return ensureBigNumbers([received.gasUsed, min, max], this.isNot, ([received, min, max]) => {
    const pass = received.gte(min) && received.lte(max);
    const message = () => matcherHint('.toCostBetween', `${received}`, `>= ${min} && <= ${max}`, this);
    return { message, pass };
  });
}
