import type { BigNumberish } from 'ethers';
import { BigNumber } from 'ethers';
import { matcherHint } from 'jest-matcher-utils';

import { forcePass, isTransactionReceipt } from '../../utils';
import { ensureBigNumbers } from '../bn/utils';
import { ignoreGasMatchers } from './common/ignoreGasMatchers';

let defaultTolerance: BigNumberish = 0.1; // 10% tolerance
export function setToCostAroundTolerance(tolerance: BigNumberish) {
  defaultTolerance = tolerance;
}

export function toCostAround(this: jest.MatcherContext, received: any, expected: any, tolerance: BigNumberish) {
  if (ignoreGasMatchers) {
    return forcePass(this.isNot);
  }

  if (!isTransactionReceipt(received)) {
    throw new Error('The received value is not a transaction receipt');
  }

  return ensureBigNumbers([received.gasUsed, expected], this.isNot, ([received, expected]) => {
    const givenOrDefault = tolerance ?? defaultTolerance;

    if (BigNumber.isBigNumber(givenOrDefault) || Number.isInteger(givenOrDefault)) {
      return toCostAroundAbsolute.call(this, received, expected, BigNumber.from(givenOrDefault));
    }

    const relativeTolerance = parseInt(`${parseFloat(`${givenOrDefault}`) * 100}`, 10);
    if (isNaN(relativeTolerance)) {
      throw new Error('Invalid relative tolerance value');
    }

    const relativeToleranceBn = BigNumber.from(relativeTolerance);
    if (!(relativeToleranceBn.lt(100) && relativeToleranceBn.gte(0))) {
      throw new Error('Invalid relative tolerance value');
    }

    return toCostAroundRelative.call(this, received, expected, relativeToleranceBn);
  });
}

function toCostAroundRelative(
  this: jest.MatcherContext,
  received: BigNumber,
  expected: BigNumber,
  tolerance: BigNumber,
) {
  const buffer = expected.mul(tolerance).div(100);
  const min = expected.sub(buffer);
  const max = expected.add(buffer);

  const pass = received.lte(max) && received.gte(min);
  const message = () => matcherHint('.toCostAround', `${received}`, `${expected} [tolerance: ${tolerance}%]`, this);

  return { message, pass };
}

function toCostAroundAbsolute(
  this: jest.MatcherContext,
  received: BigNumber,
  expected: BigNumber,
  tolerance: BigNumber,
) {
  const min = expected.sub(tolerance);
  const max = expected.add(tolerance);

  const pass = received.lte(max) && received.gte(min);
  const message = () => matcherHint('.toCostAround', `${received}`, `${expected} [tolerance: ${tolerance}]`, this);

  return { message, pass };
}
