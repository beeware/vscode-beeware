'use strict';

// This line should always be right on top.
// tslint:disable-next-line:no-any
if ((Reflect as any).metadata === undefined) {
    // tslint:disable-next-line:no-require-imports no-var-requires
    require('reflect-metadata');
}

import { Container } from 'inversify';
import { Disposable, ExtensionContext, OutputChannel, window } from 'vscode';
import { ApplicationName } from './common/constants';
import { registerTypes as platformRegisterTypes } from './common/platform/serviceRegistry';
import { registerTypes as processRegisterTypes } from './common/process/serviceRegistry';
import { registerTypes as commonRegisterTypes } from './common/serviceRegistry';
import { IDisposableRegistry, IOutputChannel } from './common/types';
import { registerTypes as cookiecutterRegisterTypes } from './cookieCutter/serviceRegistry';
import { registerTypes as debugRegisterTypes } from './debugger/serviceRegistry';
import { ServiceContainer } from './ioc/container';
import { ServiceManager } from './ioc/serviceManager';
import { IServiceContainer } from './ioc/types';
import { registerTypes as projectRegisterTypes } from './project/serviceRegistry';
import { IProjectCommand } from './project/types';
import { registerTypes as taskRegisterTypes } from './tasks/serviceRegistry';
import { ITaskCommands } from './tasks/types';
import { registerTypes as templatesRegisterTypes } from './templates/serviceRegistry';

export function activate(context: ExtensionContext) {
    const cont = new Container();
    const serviceManager = new ServiceManager(cont);
    const serviceContainer = new ServiceContainer(cont);
    registerServices(context, serviceManager, serviceContainer);
    initialize(serviceContainer);
}

function registerServices(context: ExtensionContext, serviceManager: ServiceManager, serviceContainer: ServiceContainer) {
    serviceManager.addSingletonInstance<IServiceContainer>(IServiceContainer, serviceContainer);
    serviceManager.addSingletonInstance<Disposable[]>(IDisposableRegistry, context.subscriptions);

    const outputChannel = window.createOutputChannel(ApplicationName);
    context.subscriptions.push(outputChannel);
    serviceManager.addSingletonInstance<OutputChannel>(IOutputChannel, outputChannel);

    commonRegisterTypes(serviceManager);
    platformRegisterTypes(serviceManager);
    processRegisterTypes(serviceManager);
    cookiecutterRegisterTypes(serviceManager);
    templatesRegisterTypes(serviceManager);
    projectRegisterTypes(serviceManager);
    taskRegisterTypes(serviceManager);
    debugRegisterTypes(serviceManager);
}

function initialize(serviceContainer: ServiceContainer) {
    serviceContainer.get<IProjectCommand>(IProjectCommand).register();
    serviceContainer.get<ITaskCommands>(ITaskCommands).register();
}
