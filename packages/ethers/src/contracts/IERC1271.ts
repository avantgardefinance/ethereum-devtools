import type { Call, Contract } from '@enzymefinance/ethers';
import { contract } from '@enzymefinance/ethers';
import type { BigNumber, BigNumberish } from 'ethers';

// prettier-ignore
interface IERC1271 extends Contract<IERC1271> {
  isValidSignature: Call<(_hash: BigNumberish, _signature: BigNumberish) => BigNumber, IERC1271>
  }

export const IERC1271 = contract<IERC1271>()`
function isValidSignature(uint256 _hash, uint256 memory _signature) view returns (uint16)
  `;

// Returns 0x1626ba7e if signature is valid
