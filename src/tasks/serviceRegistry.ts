// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IServiceManager } from '../ioc/types';
import { BulidRunTaskProvider } from '../tasks/buildRun';
import { ITaskProvider } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<ITaskProvider>(ITaskProvider, BulidRunTaskProvider);
}
