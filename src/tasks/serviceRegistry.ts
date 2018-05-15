// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IServiceManager } from '../ioc/types';
import { BulidRunTaskProvider } from '../tasks/taskProvider';
import { TaskCommands } from './command';
import { ITaskCommands, ITaskProvider } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<ITaskProvider>(ITaskProvider, BulidRunTaskProvider);
    serviceManager.addSingleton<ITaskCommands>(ITaskCommands, TaskCommands);
}
