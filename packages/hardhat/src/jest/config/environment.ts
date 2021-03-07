import { createCoverageCollector } from '@enzymefinance/coverage';
import { Config } from '@jest/types';
import deepmerge from 'deepmerge';
import fs from 'fs-extra';
import { HardhatNetworkConfig } from 'hardhat/types';
import NodeEnvironment from 'jest-environment-node';
import path from 'path';
import { v4 as uuid } from 'uuid';

import { hardhat } from '../../hardhat';
import { addListener } from '../../helpers';
import { EthereumTestnetProvider } from '../../provider';

export interface HardhatTestOptions {
  history: boolean;
  coverage: boolean;
  network: Partial<HardhatNetworkConfig>;
}

const defaults = {
  coverage: false,
  history: true,
  network: {},
};

export default class EnzymeHardhatEnvironment extends NodeEnvironment {
  private metadataFilePath = '';
  private tempDir = '';

  private testOptions: HardhatTestOptions;
  private testProvider?: EthereumTestnetProvider;
  private runtimeRecording: Record<string, number> = {};

  constructor(config: Config.ProjectConfig) {
    super(config);

    this.testOptions = deepmerge<HardhatTestOptions>(defaults, {
      ...(this.global.hardhatTestOptions as any),
      network: (this.global.hardhatNetworkOptions as any) ?? {},
    });

    this.tempDir = process.env.__HARDHAT_COVERAGE_TEMPDIR__ ?? '';
    if (this.testOptions.coverage && !this.tempDir) {
      throw new Error('Missing shared temporary directory for code coverage data collection');
    }
  }

  async setup() {
    await super.setup();

    const env = await hardhat(this.testOptions.network);
    const config = env.config.codeCoverage;

    this.metadataFilePath = path.join(config.path, 'metadata.json');
    this.testProvider = new EthereumTestnetProvider(env);

    this.global.hre = env;
    this.global.provider = this.testProvider;
    this.global.solidityCoverage = this.testOptions.coverage;

    // Re-route call history recording to whatever is the currently
    // active history object. Required for making history and snapshoting
    // work nicely together.
    if (this.testOptions.history) {
      addListener(env.network.provider, 'beforeMessage', (message) => {
        this.testProvider?.history.record(message);
      });
    }

    if (this.testOptions.coverage) {
      const metadata = await fs.readJson(this.metadataFilePath);
      addListener(env.network.provider, 'step', createCoverageCollector(metadata, this.runtimeRecording));
    }
  }

  async teardown() {
    if (this.testOptions.coverage && Object.keys(this.runtimeRecording).length) {
      const file = path.join(this.tempDir, `${uuid()}.json`);
      const output = {
        hits: this.runtimeRecording,
        metadata: this.metadataFilePath,
      };

      await fs.outputJson(file, output, {
        spaces: 2,
      });
    }

    await super.teardown();
  }
}
