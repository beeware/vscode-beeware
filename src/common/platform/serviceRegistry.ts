// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';

import { IServiceManager } from '../../ioc/types';
import { FileSystem } from './fileSystem';
import { PlatformService } from './platformService';
import { IFileSystem, IPlatformService } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<IFileSystem>(IFileSystem, FileSystem);
    serviceManager.addSingleton<IPlatformService>(IPlatformService, PlatformService);
}
