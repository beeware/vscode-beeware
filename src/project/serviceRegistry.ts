// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IServiceManager } from '../ioc/types';
import { CommandHandler } from './command';
import { Project } from './project';
import { ICommandHandler, IProject } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<ICommandHandler>(ICommandHandler, CommandHandler);
    serviceManager.addSingleton<IProject>(IProject, Project);
}
