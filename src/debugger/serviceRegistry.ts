// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IServiceManager } from '../ioc/types';
import { DebugConfigurationProvider } from './configProvider';
import { Debugger } from './debugger';
import { IDebugConfigurationProvider, IDebugger } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<IDebugger>(IDebugger, Debugger);
    serviceManager.addSingleton<IDebugConfigurationProvider>(IDebugConfigurationProvider, DebugConfigurationProvider);
}
