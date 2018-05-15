// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IServiceManager } from '../../ioc/types';
import { BufferDecoder } from './decoder';
import { ModuleInstaller } from './moduleInstaller';
import { ProcessServiceFactory } from './processFactory';
import { PythonExecutionFactory } from './pythonExecutionFactory';
import { IBufferDecoder, IModuleInstaller, IProcessServiceFactory, IPythonExecutionFactory } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<IBufferDecoder>(IBufferDecoder, BufferDecoder);
    serviceManager.addSingleton<IProcessServiceFactory>(IProcessServiceFactory, ProcessServiceFactory);
    serviceManager.addSingleton<IPythonExecutionFactory>(IPythonExecutionFactory, PythonExecutionFactory);
    serviceManager.addSingleton<IModuleInstaller>(IModuleInstaller, ModuleInstaller);
}
