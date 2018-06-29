// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IServiceManager } from '../ioc/types';
import { ApplicationShell } from './application/applicationShell';
import { CommandManager } from './application/commandManager';
import { DocumentManager } from './application/documentManager';
import { TerminalManager } from './application/terminalManager';
import { IApplicationShell, ICommandManager, IDocumentManager, ITerminalManager, IWorkspaceService } from './application/types';
import { WorkspaceService } from './application/workspace';
import { ConfigurationService } from './configuration/service';
import { IConfigurationService } from './configuration/types';
import { Logger } from './logger';
import { CurrentProcess } from './process/currentProcess';
import { ICurrentProcess } from './process/types';
import { TerminalServiceFactory } from './terminal/factory';
import { TerminalHelper } from './terminal/helper';
import { ITerminalHelper, ITerminalServiceFactory } from './terminal/types';
import { ILogger } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<ILogger>(ILogger, Logger);
    serviceManager.addSingleton<IApplicationShell>(IApplicationShell, ApplicationShell);
    serviceManager.addSingleton<ICurrentProcess>(ICurrentProcess, CurrentProcess);
    serviceManager.addSingleton<ICommandManager>(ICommandManager, CommandManager);
    serviceManager.addSingleton<IConfigurationService>(IConfigurationService, ConfigurationService);
    serviceManager.addSingleton<IWorkspaceService>(IWorkspaceService, WorkspaceService);
    serviceManager.addSingleton<IDocumentManager>(IDocumentManager, DocumentManager);
    serviceManager.addSingleton<ITerminalManager>(ITerminalManager, TerminalManager);
    serviceManager.addSingleton<ITerminalServiceFactory>(ITerminalServiceFactory, TerminalServiceFactory);
    serviceManager.addSingleton<ITerminalHelper>(ITerminalHelper, TerminalHelper);
}
