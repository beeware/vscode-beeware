import { inject, injectable } from 'inversify';
import * as path from 'path';
import { Uri } from 'vscode';
import { ExtensionRootDirectory } from '../common/constants';
import { ICurrentProcess, IModuleInstaller } from '../common/process/types';
import { ILogger } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { IInstaller } from './types';

@injectable()
export class Installer implements IInstaller {
    private readonly logger: ILogger;
    private readonly moduleInstaller: IModuleInstaller;
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer) {
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
        if (!await this.checkAndInstallModule('ptvsd', workspaceFolder, ['--pre'])) {
            return false;
        }

        return true;
    }

    private async checkAndInstallModule(moduleName: string, workspaceFolder: Uri, args?: string[]): Promise<boolean> {
        this.logger.info(`Checking if module '${moduleName}' is installed.`);
        const PYTHONPATH = path.join(ExtensionRootDirectory, 'python_files', 'packages');
        const currentProcess = this.serviceContainer.get<ICurrentProcess>(ICurrentProcess);
        const env = { ...currentProcess.env, PYTHONPATH };
        const cookieCutterIsInstalled = await this.moduleInstaller.isInstalled(moduleName, workspaceFolder, env);
        if (!cookieCutterIsInstalled && !await this.installModule(moduleName, workspaceFolder, args)) {
            return false;
        }
        this.logger.info(`Module '${moduleName}' is installed.`);
        return true;
    }

    private async installModule(moduleName: string, workspaceFolder: Uri, args?: string[]): Promise<boolean> {
        const targetDirectory = path.join(ExtensionRootDirectory, 'python_files', 'packages');
        return this.moduleInstaller.install(moduleName, workspaceFolder, targetDirectory, args);
    }
}
