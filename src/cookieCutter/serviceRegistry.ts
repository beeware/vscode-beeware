// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IServiceManager } from '../ioc/types';
import { CookieCutter } from './index';
import { Installer } from './installer';
import { ICookiecutter, IInstaller, IUi, IVariableService } from './types';
import { Ui } from './ui';
import { VariablesService } from './variables';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<ICookiecutter>(ICookiecutter, CookieCutter);
    serviceManager.addSingleton<IInstaller>(IInstaller, Installer);
    serviceManager.addSingleton<IUi>(IUi, Ui);
    serviceManager.addSingleton<IVariableService>(IVariableService, VariablesService);

}
