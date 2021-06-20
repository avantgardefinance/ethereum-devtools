import { BigNumber } from 'ethers';
import { matcherHint } from 'jest-matcher-utils';

import { forcePass, isTransactionReceipt } from '../../utils';
import { ensureBigNumbers } from '../bn/utils';
import { ignoreGasMatchers } from './common/ignoreGasMatchers';

let defaultTolerance = 0.1; // 10% tolerance
export function setToCostLessThanTolerance(tolerance: number) {
  defaultTolerance = tolerance;
}

// NOTE: The tolerance only applies to cost decrease, not increase. The reason for
// that is that in case of big cost improvements (reductions) you should get notified
// so that you can further restrict the gas cost assertion so that future degradations
// can be caught.
export function toCostLessThan(this: jest.MatcherContext, received: any, expected: any, tolerance?: number) {
  if (!isTransactionReceipt(received)) {
    throw new Error('The received value is not a transaction receipt');
  }

  const toleranceBn = BigNumber.from((tolerance ?? defaultTolerance) * 100);
  if (!(toleranceBn.lt(100) && toleranceBn.gte(0))) {
    throw new Error('Tolerance must be between 0% and 100%');
  }

  if (ignoreGasMatchers) {
    return forcePass(this.isNot);
  }

  return ensureBigNumbers([received.gasUsed, expected], this.isNot, ([received, expected]) => {
    const pass = received.lte(expected) && received.gte(expected.sub(expected.mul(toleranceBn).div(100)));
    const message = () =>
      matcherHint('.toCostLessThan', `${received}`, `${expected} [tolerance: ${toleranceBn}%]`, this);

    return { message, pass };
  });
}
