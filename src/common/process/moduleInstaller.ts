import { inject, injectable } from 'inversify';
import { ProgressLocation, Uri } from 'vscode';
import '../../common/extensions';
import { IServiceContainer } from '../../ioc/types';
import { IApplicationShell } from '../application/types';
import { ILogger } from '../types';
import { ICurrentProcess, IModuleInstaller, IPythonExecutionFactory } from './types';

@injectable()
export class ModuleInstaller implements IModuleInstaller {
    private readonly pythonExecServieFactory: IPythonExecutionFactory;
    private readonly logger: ILogger;
    private readonly shell: IApplicationShell;
    private readonly currentProcess: ICurrentProcess;
    constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        this.pythonExecServieFactory = serviceContainer.get<IPythonExecutionFactory>(IPythonExecutionFactory);
        this.shell = serviceContainer.get<IApplicationShell>(IApplicationShell);
        this.logger = serviceContainer.get<ILogger>(ILogger);
        this.currentProcess = serviceContainer.get<ICurrentProcess>(ICurrentProcess);
    }

    public async isInstalled(moduleName: string, workspaceFolder: Uri, env?: {}): Promise<boolean> {
        env = env ? env : {};
        env = { ...this.currentProcess.env, ...env };
        const service = await this.pythonExecServieFactory.create({ resource: workspaceFolder });
        return service.isModuleInstalled(moduleName, env);
    }
    public async install(moduleName: string, workspaceFolder: Uri, targetDirectory?: string, customArgs?: string[]): Promise<boolean> {
        const title = `Installing module ${moduleName}`;
        const options = { location: ProgressLocation.Notification, title, cancellable: true };
        return this.shell.withProgress<boolean>(options, (_, token) => new Promise(async resolve => {
            const executionService = await this.pythonExecServieFactory.create({ resource: workspaceFolder });
            const destinationMessage = targetDirectory ? ` into ${targetDirectory}` : '';
            try {
                this.logger.info(`Installing module '${moduleName}'${destinationMessage}`);
                const installDirArgs = targetDirectory ? ['-t', targetDirectory.fileToCommandArgument()] : [];
                const cacheArgs = targetDirectory ? ['--no-cache-dir'] : [];
                customArgs = customArgs ? customArgs : [];
                const args = ['-m', 'pip', 'install', ...installDirArgs, moduleName, ...customArgs, ...cacheArgs];
                await executionService.exec(args, { throwOnStdErr: true, token });
                resolve(true);
            } catch (ex) {
                const message = `Failed to install '${moduleName}'${destinationMessage}, please install manually.`;
                this.logger.error(message, ex);
                this.shell.showErrorMessage(message);
                resolve(false);
            }
        }));
    }
}
