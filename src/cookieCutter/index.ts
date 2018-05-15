import { inject, injectable } from 'inversify';
import * as path from 'path';
import { CancellationToken, ProgressLocation, Uri } from 'vscode';
import { IApplicationShell, ICommandManager } from '../common/application/types';
import { IConfigurationService } from '../common/configuration/types';
import { ApplicationName, ExtensionRootDirectory } from '../common/constants';
import { IFileSystem } from '../common/platform/types';
import { ICurrentProcess, IPythonExecutionFactory } from '../common/process/types';
import { ILogger } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { ICookiecutter, IInstaller, IVariableService, Variables } from './types';

@injectable()
export class CookieCutter implements ICookiecutter {
    private readonly installer: IInstaller;
    private readonly variablesService: IVariableService;
    private readonly executionServiceFactory: IPythonExecutionFactory;
    private readonly configurationService: IConfigurationService;
    private readonly currentProcess: ICurrentProcess;
    private readonly commandManager: ICommandManager;
    private readonly fileSystem: IFileSystem;
    private readonly logger: ILogger;
    private readonly shell: IApplicationShell;
    constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        this.shell = serviceContainer.get<IApplicationShell>(IApplicationShell);
        this.installer = serviceContainer.get<IInstaller>(IInstaller);
        this.variablesService = serviceContainer.get<IVariableService>(IVariableService);
        this.executionServiceFactory = serviceContainer.get<IPythonExecutionFactory>(IPythonExecutionFactory);
        this.configurationService = serviceContainer.get<IConfigurationService>(IConfigurationService);
        this.currentProcess = serviceContainer.get<ICurrentProcess>(ICurrentProcess);
        this.commandManager = serviceContainer.get<ICommandManager>(ICommandManager);
        this.fileSystem = serviceContainer.get<IFileSystem>(IFileSystem);
        this.logger = serviceContainer.get<ILogger>(ILogger);
    }
    public async create(workspaceFolder: Uri): Promise<void> {
        const options = { location: ProgressLocation.Notification, title: `Creating ${ApplicationName} project`, cancellable: true };
        this.shell.withProgress(options, (_, token) => this.createInternal(workspaceFolder, token));
    }

    private async createInternal(workspaceFolder: Uri, token: CancellationToken): Promise<void> {
        const executionService = await this.executionServiceFactory.create({ resource: workspaceFolder });
        if (token.isCancellationRequested) { return; }

        let variables: Variables;
        try {
            if (!await this.installer.install(workspaceFolder)) {
                return;
            }

            if (token.isCancellationRequested) { return; }

            const cookiecutterjson = path.join(ExtensionRootDirectory, 'resources', 'cookiecutter.json');
            const variableDefs = await this.variablesService.getVariableDefinitions(cookiecutterjson);
            if (token.isCancellationRequested) { return; }
            variables = await this.variablesService.generateVariables(variableDefs, workspaceFolder, token);
            if (token.isCancellationRequested) { return; }
        } catch (ex) {
            return this.logger.error('Failed to generate the variables for the cookiecutter.', ex);
        }

        try {
            // Run cookie cutter with known variables in python.
            // If any other variables are added, lets use defaults.
            // Long term plan is to create and utilize a generic cookiecutter component in VS Code.
            const file = path.join(ExtensionRootDirectory, 'python_files', 'generate_cookiecutter.py');
            const settings = this.configurationService.getSettings(workspaceFolder);
            const args = { template_git_repo: settings.cookiecutterTemplateRepoUrl, variables };
            const PYTHONPATH = path.join(ExtensionRootDirectory, 'python_files', 'packages');
            const processEnv = this.currentProcess.env;
            await executionService.exec([file, JSON.stringify(args)], { cwd: workspaceFolder.fsPath, env: { PYTHONPATH, ...processEnv }, throwOnStdErr: true });
        } catch (ex) {
            return this.logger.error('Failed to generate the cookiecutter template.', ex);
        }

        if (token.isCancellationRequested) { return; }

        // Detect the folder and open it.
        const folderToOpen = Uri.file(path.join(workspaceFolder.fsPath, variables.app_name));
        if (await this.fileSystem.directoryExists(folderToOpen.fsPath)) {
            await this.commandManager.executeCommand('vscode.openFolder', folderToOpen);
        }
    }
}
