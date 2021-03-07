import { DeployFunction } from 'hardhat-deploy/types';

const fn: DeployFunction = async function ({ deployments: { deploy, get }, ethers: { getSigners } }) {
  const deployer = (await getSigners())[0];
  const basicToken = await get('BasicToken');

  await deploy('AmIRichAlready', {
    args: [basicToken.address],
    from: deployer.address,
    log: true,
  });
};

fn.tags = ['AmIRichAlready'];
fn.dependencies = ['BasicToken'];

export default fn;
