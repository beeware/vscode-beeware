// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { injectable } from 'inversify';
import { ErrorUtils } from '../errors/errorUtils';
import { ModuleNotInstalledError } from '../errors/moduleNotInstalledError';
import { ExecutionResult, IProcessService, IPythonExecutionService, SpawnOptions } from './types';

@injectable()
export class PythonExecutionService implements IPythonExecutionService {

    constructor(private readonly procService: IProcessService, private readonly pythonPath: string) {
    }
    public async isModuleInstalled(moduleName: string, env?: {}): Promise<boolean> {
        return this.procService.exec(this.pythonPath, ['-c', `import ${moduleName}`], { throwOnStdErr: true, env })
            .then(() => true).catch(() => false);
    }

    public async exec(args: string[], options: SpawnOptions): Promise<ExecutionResult> {
        const opts: SpawnOptions = { ...options };
        return this.procService.exec(this.pythonPath, args, opts);
    }
    public async execModule(moduleName: string, args: string[], options: SpawnOptions): Promise<ExecutionResult> {
        const opts: SpawnOptions = { ...options };
        const result = await this.procService.exec(this.pythonPath, ['-m', moduleName, ...args], opts);

        // If a module is not installed we'll have something in stderr.
        if (moduleName && ErrorUtils.outputHasModuleNotInstalledError(moduleName!, result.stderr)) {
            const isInstalled = await this.isModuleInstalled(moduleName!);
            if (!isInstalled) {
                throw new ModuleNotInstalledError(moduleName!);
            }
        }

        return result;
    }
}
