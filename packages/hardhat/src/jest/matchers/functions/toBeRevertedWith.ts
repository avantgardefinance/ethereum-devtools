import { matcherHint } from 'jest-matcher-utils';

export function toBeRevertedWith(this: jest.MatcherContext, received: Error, match: string | RegExp) {
  const error = received?.message;
  const isReverted = error?.search('revert') >= 0;
  const isThrown = error?.search('invalid opcode') >= 0;
  const isError = error?.search('code=') >= 0;
  const isMatch = error?.match(match) != null;

  const pass = (isReverted || isThrown || isError) && isMatch;
  const message = pass
    ? () => matcherHint('.toBeRevertedWith', error, `${match}`, this)
    : () => matcherHint('.toBeRevertedWith', error, `${match}`, this);

  return { message, pass };
}
