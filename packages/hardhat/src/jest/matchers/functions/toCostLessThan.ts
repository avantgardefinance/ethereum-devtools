import type { BigNumberish } from 'ethers';
import { BigNumber } from 'ethers';
import { matcherHint } from 'jest-matcher-utils';

import { forcePass, isTransactionReceipt } from '../../utils';
import { ensureBigNumbers } from '../bn/utils';
import { ignoreGasMatchers } from './common/ignoreGasMatchers';

let defaultTolerance: BigNumberish = 0.1; // 10% tolerance

export function setToCostLessThanTolerance(tolerance: BigNumberish) {
  defaultTolerance = tolerance;
}

// NOTE: The tolerance only applies to cost decrease, not increase. The reason for
// that is that in case of big cost improvements (reductions) you should get notified
// so that you can further restrict the gas cost assertion so that future degradations
// can be caught.
export function toCostLessThan(this: jest.MatcherContext, received: any, expected: any, tolerance: BigNumberish) {
  if (ignoreGasMatchers) {
    return forcePass(this.isNot);
  }

  if (!isTransactionReceipt(received)) {
    throw new Error('The received value is not a transaction receipt');
  }

  return ensureBigNumbers([received.gasUsed, expected], this.isNot, ([received, expected]) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const givenOrDefault = tolerance ?? defaultTolerance;

    if (BigNumber.isBigNumber(givenOrDefault) || Number.isInteger(givenOrDefault)) {
      return toCostLessThanAbsolute.call(this, received, expected, BigNumber.from(givenOrDefault));
    }

    const relativeTolerance = parseInt(`${parseFloat(`${givenOrDefault}`) * 100}`, 10);

    if (isNaN(relativeTolerance)) {
      throw new Error('Invalid relative tolerance value');
    }

    const relativeToleranceBn = BigNumber.from(relativeTolerance);

    if (!(relativeToleranceBn.lt(100) && relativeToleranceBn.gte(0))) {
      throw new Error('Invalid relative tolerance value');
    }

    return toCostLessThanRelative.call(this, received, expected, relativeToleranceBn);
  });
}

function toCostLessThanRelative(
  this: jest.MatcherContext,
  received: BigNumber,
  expected: BigNumber,
  tolerance: BigNumber,
) {
  const pass = received.lte(expected) && received.gte(expected.sub(expected.mul(tolerance).div(100)));
  const message = () => matcherHint('.toCostLessThan', `${received}`, `${expected} [tolerance: ${tolerance}%]`, this);

  return { message, pass };
}

function toCostLessThanAbsolute(
  this: jest.MatcherContext,
  received: BigNumber,
  expected: BigNumber,
  tolerance: BigNumber,
) {
  const pass = received.lte(expected) && received.gte(expected.sub(tolerance));
  const message = () => matcherHint('.toCostLessThan', `${received}`, `${expected} [tolerance: ${tolerance}]`, this);

  return { message, pass };
}
