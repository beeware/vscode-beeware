import { inject, injectable } from 'inversify';
import { EOL } from 'os';
import { OutputChannel, ProgressLocation, Uri } from 'vscode';
import { IApplicationShell } from '../common/application/types';
import { IConfigurationService } from '../common/configuration/types';
import { ApplicationName } from '../common/constants';
import { IModuleInstaller, IProcessServiceFactory } from '../common/process/types';
import { ILogger, IOutputChannel } from '../common/types';
import { ICookiecutter } from '../cookieCutter/types';
import { IServiceContainer } from '../ioc/types';
import { BeeWareExecutionHelper } from '../tasks/helper';
import { Target } from '../tasks/types';
import { IProjectService, ISetupService, IStartupService, ProjectInfo, StartupInfo } from './types';

@injectable()
export class Project implements IProjectService {
    private readonly outputChannel: OutputChannel;
    private readonly processExecutionFactory: IProcessServiceFactory;
    private readonly configurationService: IConfigurationService;
    private readonly logger: ILogger;
    private readonly shell: IApplicationShell;
    private readonly moduleInstaller: IModuleInstaller;
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer) {
        this.logger = serviceContainer.get<ILogger>(ILogger);
        this.outputChannel = serviceContainer.get<OutputChannel>(IOutputChannel);
        this.processExecutionFactory = serviceContainer.get<IProcessServiceFactory>(IProcessServiceFactory);
        this.configurationService = serviceContainer.get<IConfigurationService>(IConfigurationService);
        this.shell = serviceContainer.get<IApplicationShell>(IApplicationShell);
        this.moduleInstaller = serviceContainer.get<IModuleInstaller>(IModuleInstaller);
    }
    public async create(workspaceFolder: Uri): Promise<void> {
        const cookieCutter = this.serviceContainer.get<ICookiecutter>(ICookiecutter);
        return cookieCutter.create(workspaceFolder);
    }
    public async getProjectInfo(workspaceFolder: Uri): Promise<ProjectInfo | undefined> {
        return this.serviceContainer.get<ISetupService>(ISetupService).parseSetup(workspaceFolder);
    }
    public async getStartupInfo(workspaceFolder: Uri, target: Target): Promise<StartupInfo | undefined> {
        let service: IStartupService;
        try {
            service = this.serviceContainer.get<IStartupService>(target);
        } catch (ex) {
            this.shell.showErrorMessage(`Debugging of '${target}' not yet supported`);
            return;
        }
        return service.getStarupInfo(workspaceFolder, target);
    }
    public async build(workspaceFolder: Uri, target: Target): Promise<void> {
        return this.buildOrRun(workspaceFolder, target, 'build');
    }
    public async run(workspaceFolder: Uri, target: Target): Promise<void> {
        return this.buildOrRun(workspaceFolder, target, 'run');
    }
    public async buildOrRun(workspaceFolder: Uri, target: Target, buildOrRumCmd: 'build' | 'run'): Promise<void> {
        if (!await this.checkAndInstallModule('beeware', workspaceFolder)) {
            return;
        }

        const build = buildOrRumCmd === 'build';
        const title = `${build ? 'Building' : 'Running'} ${ApplicationName} on ${target}`;

        this.logger.info(`${EOL}${title}${EOL}`);
        this.outputChannel.appendLine(`${EOL}${title}`);
        this.outputChannel.show();

        const options = { location: ProgressLocation.Notification, title, cancellable: true };
        const logger = this.serviceContainer.get<ILogger>(ILogger);
        return this.shell.withProgress<void>(options, (_, token) => new Promise(async (resolve, reject) => {
            try {
                const pythonPath = this.configurationService.getSettings(workspaceFolder).pythonPath;
                const beewarePath = this.configurationService.getSettings(workspaceFolder).beewarePath;
                const executionInfo = new BeeWareExecutionHelper().buildExecutionArgs(pythonPath, beewarePath);

                const executionService = await this.processExecutionFactory.create(workspaceFolder);
                const args = [...executionInfo.args, buildOrRumCmd, target];
                const result = executionService.execObservable(executionInfo.command, args, { cwd: workspaceFolder.fsPath, token });
                result.out.subscribe(output => {
                    if (output.source === 'stderr') {
                        logger.error(output.out);
                    } else {
                        logger.info(output.out);
                    }
                    this.outputChannel.append(output.out);
                }, ex => {
                    logger.error(`Failed to ${build ? 'build' : 'run'} the project on target '${target}'`, ex);
                    reject(ex);
                }, () => {
                    resolve();
                });
            } catch (ex) {
                logger.error(`Failed to ${build ? 'build' : 'run'} the project on target '${target}'`, ex);
                reject(ex);
            }
        }));
    }
    private async checkAndInstallModule(moduleName: string, workspaceFolder: Uri): Promise<boolean> {
        this.logger.info(`Checking if module '${moduleName}' is installed.`);
        const cookieCutterIsInstalled = await this.moduleInstaller.isInstalled(moduleName, workspaceFolder);
        if (cookieCutterIsInstalled) {
            return true;
        }
        const result = await this.shell.showInformationMessage(`Module '${moduleName}' not installed, would you like to install it?`, 'Install', 'Cancel');
        if (result !== 'Install') {
            return false;
        }
        if (!await this.moduleInstaller.install(moduleName, workspaceFolder)) {
            return false;
        }

        this.logger.info(`Module '${moduleName}' is installed.`);
        return true;
    }

}
