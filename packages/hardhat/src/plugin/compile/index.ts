import { formatOutput, generateContract } from '@enzymefinance/codegen';
import deepmerge from 'deepmerge';
import { utils } from 'ethers';
import fs from 'fs-extra';
import { extendConfig, task } from 'hardhat/config';
import type { Artifact } from 'hardhat/types';
import path from 'path';

import { clearDirectory, createDirectory, regexOrString, validateDir } from '../utils';
import type { CodeGeneratorConfig } from './types';

export * from './types';

extendConfig((config, userConfig) => {
  const defaults: CodeGeneratorConfig = {
    abi: {
      enabled: true,
      path: './abi',
    },
    bytecode: {
      enabled: true,
      path: './bytecode',
    },
    clear: false,
    enabled: false,
    exclude: [],
    include: [],
    options: {
      ignoreContractsWithoutAbi: false,
      ignoreContractsWithoutBytecode: false,
      ignoreExternalContracts: true,
    },
    typescript: {
      enabled: true,
      path: './typescript',
    },
  };

  const provided = userConfig.codeGenerator ?? {};
  config.codeGenerator = deepmerge<CodeGeneratorConfig>(defaults, provided as any);
  config.codeGenerator.abi.path = validateDir(config.paths.root, config.codeGenerator.abi.path);
  config.codeGenerator.bytecode.path = validateDir(config.paths.root, config.codeGenerator.bytecode.path);
  config.codeGenerator.typescript.path = validateDir(config.paths.root, config.codeGenerator.typescript.path);

  config.codeGenerator.include = config.codeGenerator.include.map((item) => {
    return regexOrString(item);
  });

  config.codeGenerator.exclude = config.codeGenerator.exclude.map((item) => {
    return regexOrString(item);
  });
});

interface Arguments {
  clear: boolean;
}

task<Arguments>('compile', async (args, env, parent) => {
  await parent(args);

  const config = env.config.codeGenerator;
  if (!config.enabled) {
    return;
  }

  if (!config.abi.enabled && !config.bytecode.enabled && !config.typescript.enabled) {
    return;
  }

  const [abi, bytecode, typescript] = [
    config.abi.enabled && config.abi.path,
    config.bytecode.enabled && config.bytecode.path,
    config.typescript.enabled && config.typescript.path,
  ];

  const dirs = [abi, bytecode, typescript].filter(
    (item, index, array) => !!item && array.indexOf(item) === index,
  ) as string[];

  if (config.clear || args.clear) {
    await Promise.all(dirs.map(async (dir) => clearDirectory(dir)));
  }

  await Promise.all(dirs.map(async (dir) => createDirectory(dir)));

  // Flatten the artifacts array (thus remove duplicates). This might eliminate
  // artifacts for identically named contracts that are actually different. For
  // simplicity, we simply don't support that *shrug*.
  const paths = (await env.artifacts.getArtifactPaths())
    .map((artifact) => ({
      name: path.basename(artifact, '.json'),
      path: artifact,
    }))
    .filter((outer, index, array) => {
      return array.findIndex((inner) => inner.name === outer.name) === index;
    });

  let artifacts = await Promise.all(
    paths.map(async (item) => {
      const artifact = await env.artifacts.readArtifact(item.name);
      const source = path.join(env.config.paths.root, artifact.sourceName);
      const external = !(await fs.pathExists(source));

      const included = config.include.some((rule) =>
        typeof rule === 'string' ? item.name === rule : item.name.match(rule) != null,
      );

      const excluded = config.exclude.some((rule) =>
        typeof rule === 'string' ? item.name === rule : item.name.match(rule) != null,
      );

      return { ...item, artifact, excluded, external, included };
    }),
  );

  artifacts = artifacts.filter((item) => (item.excluded && !item.included ? false : true));

  if (config.options.ignoreContractsWithoutAbi) {
    artifacts = artifacts.filter((item) => item.included || item.artifact.abi.length > 0);
  }

  if (config.options.ignoreContractsWithoutBytecode) {
    artifacts = artifacts.filter((item) => item.included || item.artifact.bytecode !== '0x');
  }

  if (config.options.ignoreExternalContracts) {
    artifacts = artifacts.filter((item) => item.included || !item.external);
  }

  if (!artifacts.length) {
    console.error(`None of the compiled contract artifacts matched your include/exclude rules for code generation.`);
    return;
  }

  await Promise.all<any>([
    abi && generateAbiFiles(abi, artifacts),
    bytecode && generateBytecodeFiles(bytecode, artifacts),
    typescript && generateTypeScriptFiles(typescript, artifacts),
  ]);
}).addFlag('clear', 'Clears previous build artifacts.');

interface ArtifactDescriptor {
  name: string;
  path: string;
  artifact: Artifact;
}

async function generateAbiFiles(dir: string, artifacts: ArtifactDescriptor[]): Promise<void> {
  await Promise.all(
    artifacts.map(async (artifact) => {
      const destination = path.resolve(dir, `${artifact.name}.json`);
      return await fs.writeJson(destination, artifact.artifact.abi, {
        spaces: 2,
      });
    }),
  );
}

async function generateBytecodeFiles(dir: string, artifacts: ArtifactDescriptor[]): Promise<void> {
  await Promise.all(
    artifacts.map(async (artifact) => {
      const destination = path.resolve(dir, `${artifact.name}.bin.json`);
      const content = { bytecode: artifact.artifact.bytecode };
      return await fs.writeJson(destination, content, {
        spaces: 2,
      });
    }),
  );
}

async function generateTypeScriptFiles(dir: string, artifacts: ArtifactDescriptor[]): Promise<void> {
  await Promise.all(
    artifacts.map(async (artifact) => {
      const abi = new utils.Interface(artifact.artifact.abi);
      const content = generateContract(artifact.name, artifact.artifact.bytecode, abi);
      const formatted = formatOutput(content);
      const destination = path.join(dir, `${artifact.name}.ts`);
      return await fs.writeFile(destination, formatted);
    }),
  );
}
