// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IServiceManager } from '../ioc/types';
import { Debugger } from './debugger';
import { IDebugger } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<IDebugger>(IDebugger, Debugger);
}
