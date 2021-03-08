import 'hardhat-deploy-ethers/dist/src/type-extensions';
import 'hardhat-deploy/dist/src/type-extensions';
import 'hardhat-deploy/dist/src/type-extensions';

import type { AddressLike, CallFunction, SendFunction } from '@enzymefinance/ethers';
import type { BigNumberish, utils } from 'ethers';
import type { HardhatRuntimeEnvironment } from 'hardhat/types';

import type { EthereumTestnetProvider } from './provider';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace globalThis {
    // eslint-disable-next-line no-var
    var hre: HardhatRuntimeEnvironment;
    // eslint-disable-next-line no-var
    var provider: EthereumTestnetProvider;
    // eslint-disable-next-line no-var
    var __COVERAGE__: boolean;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeProperAddress(): R;
      toBeProperPrivateKey(): R;
      toBeProperHex(length: number): R;
      toMatchAddress(expected: AddressLike): R;
      toMatchParams(types: utils.ParamType | utils.ParamType[], expected: any): R;
      toMatchFunctionOutput(
        fragment: string | utils.FunctionFragment | CallFunction<any> | SendFunction<any>,
        expected: any,
      ): R;
      toMatchEventArgs(expected: any): R;
      toBeGtBigNumber(expected: BigNumberish): R;
      toBeLtBigNumber(expected: BigNumberish): R;
      toBeGteBigNumber(expected: BigNumberish): R;
      toBeLteBigNumber(expected: BigNumberish): R;
      toEqBigNumber(expected: BigNumberish): R;
      toBeReverted(): R;
      toBeRevertedWith(message: string): R;
      toBeReceipt(): R;
      toCostLessThan(expected: BigNumberish, tolerance?: BigNumberish): R;
      toHaveEmitted(event: string | utils.EventFragment): R;
      toHaveEmittedWith(event: string | utils.EventFragment, expected: any): R;
      toHaveBeenCalledOnContract(): R;
      toHaveBeenCalledOnContractWith<TArgs extends any[] = []>(...args: TArgs): Promise<R>;
    }
  }
}
