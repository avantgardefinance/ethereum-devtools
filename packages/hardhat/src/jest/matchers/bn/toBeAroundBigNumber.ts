import { BigNumber, BigNumberish } from 'ethers';
import { matcherHint } from 'jest-matcher-utils';

import { ensureBigNumbers } from './utils';

// Ensure that global variables are initialized.
let defaultTolerance = 0.1; // 10% tolerance
export function setToBeAroundBigNumberTolerance(tolerance: number) {
  defaultTolerance = tolerance;
}

export function toBeAroundBigNumber(
  this: jest.MatcherContext,
  received: BigNumberish,
  expected: BigNumberish,
  tolerance?: number,
) {
  return ensureBigNumbers([received, expected], this.isNot, ([received, expected]) => {
    const toleranceBn = BigNumber.from((tolerance ?? defaultTolerance) * 100);
    if (!(toleranceBn.lt(100) && toleranceBn.gt(0))) {
      throw new Error('Tolerance must be between 0% and 100%');
    }

    const min = expected.mul(BigNumber.from(100).sub(toleranceBn)).div(BigNumber.from(100));
    const max = expected.mul(BigNumber.from(100).add(toleranceBn)).div(BigNumber.from(100));

    const pass = received.gte(min) && received.lte(max);
    const message = () => matcherHint('.toBeAroundBigNumber', `${received}`, `${expected}`, this);
    return { message, pass };
  });
}
