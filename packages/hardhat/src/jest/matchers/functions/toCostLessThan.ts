import { BigNumber } from 'ethers';
import { matcherHint } from 'jest-matcher-utils';

import { forcePass, isTransactionReceipt } from '../../utils';
import { ensureBigNumbers } from '../bn/utils';

// Ensure that global variables are initialized.
let ignoreGasMatchers = false;
export function setIgnoreGasMatchers(ignore: boolean) {
  ignoreGasMatchers = ignore;
}

let defaultTolerance = 0.1; // 10% tolerance
export function setGasCostAssertionTolerance(tolerance: number) {
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

  return ensureBigNumbers(received.gasUsed, expected, this.isNot, (received, expected) => {
    const pass = received.lt(expected) && received.gt(expected.sub(expected.mul(toleranceBn).div(100)));
    const message = pass
      ? () => matcherHint('.toCostLessThan', `${received}`, `${expected} [${toleranceBn}% tolerance]`, this)
      : () => matcherHint('.toCostLessThan', `${received}`, `${expected} [${toleranceBn}% tolerance]`, this);

    return { message, pass };
  });
}
