// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import { inject, injectable } from 'inversify';
import { CancellationToken, DebugConfiguration, WorkspaceFolder } from 'vscode';
import { IApplicationShell } from '../common/application/types';
import { IServiceContainer } from '../ioc/types';
import { ITaskProvider } from '../tasks/types';
import { IDebugConfigurationProvider, IDebugger } from './types';

@injectable()
export class DebugConfigurationProvider implements IDebugConfigurationProvider {
    constructor(@inject(IServiceContainer) private readonly serviceContainer: IServiceContainer) { }
    public async provideDebugConfigurations?(folder: WorkspaceFolder | undefined, _token?: CancellationToken): Promise<DebugConfiguration[]> {
        return [
            {
                name: 'Debug BeeWare',
                request: 'launch',
                type: 'beeware'
            }
        ];
    }
    public async resolveDebugConfiguration?(folder: WorkspaceFolder | undefined, _debugConfiguration: DebugConfiguration, _token?: CancellationToken): Promise<DebugConfiguration> {
        if (!folder) {
            throw new Error('Please open a Beeware Project');
        }

        const target = this.serviceContainer.get<ITaskProvider>(ITaskProvider).getDefaultTarget();
        const appShell = this.serviceContainer.get<IApplicationShell>(IApplicationShell);
        const rebuild = await appShell.showInformationMessage('Would you like to rebuild the project? Click \'Yes\' if code changes were made', 'Yes', 'No');
        const config = await this.serviceContainer.get<IDebugger>(IDebugger).getDebugConfiguration(folder.uri, target, rebuild === 'Yes');
        if (config) {
            return config;
        }
        throw new Error('Failed to debug');
    }

}
