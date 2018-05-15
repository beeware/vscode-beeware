// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { Uri } from 'vscode';
import { IServiceContainer } from '../../ioc/types';
import { IWorkspaceService } from '../application/types';
import { BeeWareSettings } from './settings';
import { IBeeWareSettings, IConfigurationService } from './types';

@injectable()
export class ConfigurationService implements IConfigurationService {
    private readonly workspaceService: IWorkspaceService;
    constructor(@inject(IServiceContainer) private readonly serviceContainer: IServiceContainer) {
        this.workspaceService = this.serviceContainer.get<IWorkspaceService>(IWorkspaceService);
    }
    public getSettings(resource?: Uri): IBeeWareSettings {
        const workspaceFolder = resource ? this.workspaceService.getWorkspaceFolder(resource) : undefined;
        return new BeeWareSettings(this.serviceContainer, workspaceFolder ? workspaceFolder.uri : undefined);
    }
}
