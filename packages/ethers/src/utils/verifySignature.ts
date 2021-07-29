import { BigNumber, utils } from 'ethers';

import { IERC1271 } from '../contracts/IERC1271';
import { sameAddress } from './sameAddress';

interface VerifySignatureProps {
  walletAddress: string;
  message: string | utils.Bytes;
  signature: string;
}

export async function verifySignature({ walletAddress, message, signature }: VerifySignatureProps): Promise<boolean> {
  try {
    const bytecode = await provider.getCode(walletAddress);
    const isSmartContract = bytecode && utils.hexStripZeros(bytecode) !== '0x';
    if (isSmartContract) {
      const hash = utils.keccak256(message);
      const contract = new IERC1271(walletAddress, provider);
      const result = await contract.isValidSignature(hash, signature);
      // Per https://eips.ethereum.org/EIPS/eip-1271
      return result === BigNumber.from(0x1626ba7e);
    } else {
      const recoveredAddress = utils.verifyMessage(message, signature);
      return sameAddress(recoveredAddress, walletAddress);
    }
  } catch {
    return false;
  }
}
