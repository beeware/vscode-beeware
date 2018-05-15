// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IServiceManager } from '../ioc/types';
import { ProjectCommand } from './command';
import { Project } from './project';
import { IProject, IProjectCommand } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<IProjectCommand>(IProjectCommand, ProjectCommand);
    serviceManager.addSingleton<IProject>(IProject, Project);
}
