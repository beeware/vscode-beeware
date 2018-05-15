import { inject } from 'inversify';
import { EOL } from 'os';
import { OutputChannel, ProgressLocation, Uri } from 'vscode';
import { IApplicationShell, ICommandManager, IWorkspaceService } from '../common/application/types';
import { IConfigurationService } from '../common/configuration/types';
import { ApplicationName } from '../common/constants';
import { IModuleInstaller, IProcessServiceFactory } from '../common/process/types';
import { ILogger, IOutputChannel } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { BeeWareExecutionHelper } from './helper';
import { ITaskProvider } from './types';

export class BulidRunTaskProvider implements ITaskProvider {
    private readonly commandManager: ICommandManager;
    private readonly outputChannel: OutputChannel;
    private readonly processExecutionFactory: IProcessServiceFactory;
    private readonly workspaceService: IWorkspaceService;
    private readonly configurationService: IConfigurationService;
    private readonly logger: ILogger;
    private readonly shell: IApplicationShell;
    private readonly moduleInstaller: IModuleInstaller;
    constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        this.commandManager = serviceContainer.get<ICommandManager>(ICommandManager);
        this.logger = serviceContainer.get<ILogger>(ILogger);
        this.outputChannel = serviceContainer.get<OutputChannel>(IOutputChannel);
        this.processExecutionFactory = serviceContainer.get<IProcessServiceFactory>(IProcessServiceFactory);
        this.workspaceService = serviceContainer.get<IWorkspaceService>(IWorkspaceService);
        this.configurationService = serviceContainer.get<IConfigurationService>(IConfigurationService);
        this.shell = serviceContainer.get<IApplicationShell>(IApplicationShell);
        this.moduleInstaller = serviceContainer.get<IModuleInstaller>(IModuleInstaller);
    }

    public async initialize() {
        const items = [
            { command: 'beeware.buildWindows', target: 'windows', isBuild: true },
            { command: 'beeware.buildMac', target: 'macos', isBuild: true },
            { command: 'beeware.buildLinux', target: 'linux', isBuild: true },
            { command: 'beeware.buildIOS', target: 'ios', isBuild: true },
            { command: 'beeware.buildAndroid', target: 'android', isBuild: true },
            { command: 'beeware.runWindows', target: 'windows', isBuild: false },
            { command: 'beeware.runMac', target: 'macos', isBuild: false },
            { command: 'beeware.runLinux', target: 'linux', isBuild: false },
            { command: 'beeware.runIOS', target: 'ios', isBuild: false },
            { command: 'beeware.runAndroid', target: 'android', isBuild: false }
        ];

        items.forEach(item => this.commandManager.registerCommand(item.command, () => this.buildHandler(item.isBuild ? 'build' : 'run', item.target)));
    }
    private async buildHandler(buildOrRun: 'build' | 'run', target: string): Promise<void> {
        this.logger.info(EOL);
        this.logger.info(`${buildOrRun ? 'Build' : 'Run'} '${target}'`);
        const workspaceFolder = await this.workspaceService.selectWorkspaceFolder();
        if (!workspaceFolder) {
            return;
        }
        if (!await this.checkAndInstallModule('beeware', workspaceFolder.uri)) {
            return;
        }

        const executionService = await this.processExecutionFactory.create(workspaceFolder.uri);
        const pythonPath = this.configurationService.getSettings(workspaceFolder.uri).pythonPath;
        const beewarePath = this.configurationService.getSettings(workspaceFolder.uri).beewarePath;
        const executionInfo = new BeeWareExecutionHelper().buildExecutionArgs(pythonPath, beewarePath);

        const title = `${buildOrRun ? 'Building' : 'Running'} ${ApplicationName} on ${target}`;
        const options = { location: ProgressLocation.Notification, title, cancellable: true };
        this.shell.withProgress(options, (_, token) => new Promise((resolve, reject) => {
            const cmd = buildOrRun ? 'build' : 'run';
            const args = [...executionInfo.args, cmd, target];
            const output = executionService.execObservable(executionInfo.command, args, { cwd: workspaceFolder.uri.fsPath, token });
            output.out.subscribe(item => {
                if (item.source === 'stderr') {
                    this.logger.error(item.out);
                } else {
                    this.logger.info(item.out);
                }
                this.outputChannel.append(item.out);
            }, error => {
                this.logger.error(`${buildOrRun ? 'Build' : 'Run'} failed`, error);
                reject(error);
            }, () => {
                resolve();
            });
        }));
    }
    private async checkAndInstallModule(moduleName: string, workspaceFolder: Uri): Promise<boolean> {
        this.logger.info(`Checking if module '${moduleName}' is installed.`);
        const cookieCutterIsInstalled = await this.moduleInstaller.isInstalled(moduleName, workspaceFolder);
        if (!cookieCutterIsInstalled) {
            const result = await this.shell.showInformationMessage(`Module '${moduleName}' not installed, would you like to install it?`, 'Install');
            if (result !== 'Install') {
                return false;
            }
        }

        if (!await this.moduleInstaller.install(moduleName, workspaceFolder)) {
            return false;
        }

        this.logger.info(`Module '${moduleName}' is installed.`);
        return true;
    }

}
