import { inject, injectable } from 'inversify';
import * as path from 'path';
import { Uri } from 'vscode';
import { ExtensionRootDirectory } from '../common/constants';
import { IModuleInstaller } from '../common/process/types';
import { ILogger } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { IInstaller } from './types';

@injectable()
export class Installer implements IInstaller {
    private readonly logger: ILogger;
    private readonly moduleInstaller: IModuleInstaller;
    constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        this.logger = serviceContainer.get<ILogger>(ILogger);
        this.moduleInstaller = serviceContainer.get<IModuleInstaller>(IModuleInstaller);
    }

    public async install(workspaceFolder: Uri): Promise<boolean> {
        if (!await this.checkAndInstallModule('cookiecutter', workspaceFolder)) {
            return false;
        }
        if (!await this.checkAndInstallModule('jinja2', workspaceFolder)) {
            return false;
        }

        return true;
    }

    private async checkAndInstallModule(moduleName: string, workspaceFolder: Uri): Promise<boolean> {
        this.logger.info(`Checking if module '${moduleName}' is installed.`);
        const cookieCutterIsInstalled = await this.moduleInstaller.isInstalled(moduleName, workspaceFolder);
        if (!cookieCutterIsInstalled && !await this.installModule(moduleName, workspaceFolder)) {
            return false;
        }
        this.logger.info(`Module '${moduleName}' is installed.`);
        return true;
    }

    private async installModule(moduleName: string, workspaceFolder: Uri): Promise<boolean> {
        const targetDirectory = path.join(ExtensionRootDirectory, 'python_files');
        return this.moduleInstaller.install(moduleName, workspaceFolder, targetDirectory);
    }
}
