import deepmerge from 'deepmerge';
import { HARDHAT_NETWORK_NAME } from 'hardhat/internal/constants';
import { HardhatContext } from 'hardhat/internal/context';
import { loadConfigAndTasks } from 'hardhat/internal/core/config/config-loading';
import { getEnvHardhatArguments } from 'hardhat/internal/core/params/env-variables';
import { HARDHAT_PARAM_DEFINITIONS } from 'hardhat/internal/core/params/hardhat-params';
import { Environment } from 'hardhat/internal/core/runtime-environment';
import { loadTsNode, willRunWithTypescript } from 'hardhat/internal/core/typescript-support';
import { HardhatArguments, HardhatConfig, HardhatNetworkConfig, HardhatRuntimeEnvironment } from 'hardhat/types';

export async function hardhat(network: Partial<HardhatNetworkConfig> = {}) {
  if (!HardhatContext.isCreated()) {
    HardhatContext.createHardhatContext();
  }

  const context = HardhatContext.getHardhatContext();
  const args = deepmerge<HardhatArguments>(getEnvHardhatArguments(HARDHAT_PARAM_DEFINITIONS, process.env), {
    emoji: false,
    help: false,
    network: HARDHAT_NETWORK_NAME,
    version: false,
  });

  if (willRunWithTypescript(args.config)) {
    loadTsNode();
  }

  const config = deepmerge<HardhatConfig>(loadConfigAndTasks(), {
    networks: {
      [HARDHAT_NETWORK_NAME]: network,
    } as any,
  });

  const extenders = context.extendersManager.getExtenders();

  return (new Environment(config, args, {}, extenders) as unknown) as HardhatRuntimeEnvironment;
}
