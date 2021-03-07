import { utils } from 'ethers';
import { DeployFunction } from 'hardhat-deploy/types';

const fn: DeployFunction = async function ({ deployments: { deploy }, ethers: { getSigners } }) {
  const deployer = (await getSigners())[0];

  await deploy('BasicToken', {
    args: [utils.parseEther('1')],
    from: deployer.address,
    log: true,
  });
};

fn.tags = ['BasicToken'];

export default fn;
