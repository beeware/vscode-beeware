import { inject, injectable } from 'inversify';
import { Uri } from 'vscode';
import { IServiceContainer } from '../../ioc/types';
import { IApplicationShell } from '../application/types';
import { ILogger } from '../types';
import { IModuleInstaller, IPythonExecutionFactory } from './types';

@injectable()
export class ModuleInstaller implements IModuleInstaller {
    private readonly pythonExecServieFactory: IPythonExecutionFactory;
    private readonly logger: ILogger;
    private readonly shell: IApplicationShell;
    constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        this.pythonExecServieFactory = serviceContainer.get<IPythonExecutionFactory>(IPythonExecutionFactory);
        this.shell = serviceContainer.get<IApplicationShell>(IApplicationShell);
        this.logger = serviceContainer.get<ILogger>(ILogger);
    }

    public async isInstalled(moduleName: string, workspaceFolder: Uri): Promise<boolean> {
        const service = await this.pythonExecServieFactory.create({ resource: workspaceFolder });
        return service.isModuleInstalled(moduleName);
    }
    public async install(moduleName: string, workspaceFolder: Uri, targetDirectory?: string): Promise<boolean> {
        const executionService = await this.pythonExecServieFactory.create({ resource: workspaceFolder });
        try {
            this.logger.info(`Installing module '${moduleName}' into ${targetDirectory}`);
            const installDirArgs = targetDirectory ? ['-t', targetDirectory.fileToCommandArgument()] : [];
            const cacheArgs = targetDirectory ? ['--no-cache-dir'] : [];
            const args = ['-m', 'pip', 'install', ...installDirArgs, moduleName, ...cacheArgs];
            await executionService.exec(args, { throwOnStdErr: true });
            return true;
        } catch (ex) {
            const targetDirMessage = targetDirectory ? `into the path ${targetDirectory}` : '';
            const message = `Failed to install '${moduleName}'${targetDirMessage}, please install manually.`;
            this.logger.error(message, ex);
            this.shell.showErrorMessage(message);
            return false;
        }
    }


}
