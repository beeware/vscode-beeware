// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IServiceManager } from '../ioc/types';
import { Target } from '../tasks/types';
import { ProjectCommand } from './command';
import { Project } from './project';
import { SetupService } from './setupService';
import { StartupService as LinuxStartupService } from './targets/linux';
import { StartupService as MacOSStartupService } from './targets/macos';
import { StartupService as WindowsStartupService } from './targets/windows';
import { TargetService } from './targetService';
import { IProjectCommand, IProjectService, ISetupService, IStartupService, ITargetService } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<IProjectCommand>(IProjectCommand, ProjectCommand);
    serviceManager.addSingleton<IProjectService>(IProjectService, Project);
    serviceManager.addSingleton<ISetupService>(ISetupService, SetupService);
    serviceManager.addSingleton<ITargetService>(ITargetService, TargetService);
    serviceManager.addSingleton<IStartupService>(Target.macOS, MacOSStartupService);
    serviceManager.addSingleton<IStartupService>(Target.linux, LinuxStartupService);
    serviceManager.addSingleton<IStartupService>(Target.windows, WindowsStartupService);
}
