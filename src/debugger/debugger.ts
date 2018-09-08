import { inject, injectable } from 'inversify';
import * as path from 'path';
import { noop } from 'rxjs';
import { debug, DebugConfiguration, Uri } from 'vscode';
import { IApplicationShell, IWorkspaceService } from '../common/application/types';
import { ApplicationName, ExtensionRootDirectory } from '../common/constants';
import { ILogger } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { IProjectService, StartupInfo } from '../project/types';
import { Target } from '../tasks/types';
import { IDebugger } from './types';

@injectable()
export class Debugger implements IDebugger {
    private readonly logger: ILogger;
    private readonly appShell: IApplicationShell;
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer) {
        this.logger = this.serviceContainer.get<ILogger>(ILogger);
        this.appShell = this.serviceContainer.get<IApplicationShell>(IApplicationShell);
    }
    public async getDebugConfiguration(workspaceFolderUri: Uri, target: Target, build: boolean = false): Promise<DebugConfiguration | undefined> {
        const workspaceFolder = this.serviceContainer.get<IWorkspaceService>(IWorkspaceService).getWorkspaceFolder(workspaceFolderUri);
        if (!workspaceFolder) {
            return;
        }

        const project = this.serviceContainer.get<IProjectService>(IProjectService);
        let startupInfo: StartupInfo | undefined;
        try {
            startupInfo = await project.getStartupInfo(workspaceFolderUri, target);
        } catch (ex) {
            this.logger.error('Failed to get app name and formal name', ex);
            this.appShell.showErrorMessage('Failed to retrieve the App name and formal name from setup.py. Please update settings.json with relevant info.');
            return;
        }
        if (!startupInfo) {
            return;
        }

        if (build) {
            // Always re-build before debugging.
            // Always run in the terminal, cuz when terminal is not activated, build fails.
            await project.build(workspaceFolderUri, target, true).catch(noop);
            const appShell = this.serviceContainer.get<IApplicationShell>(IApplicationShell);
            const cmd = 'Re-launch Debugger';
            await appShell.showInformationMessage('Please re-launch the debugger once the build has completed (remember not to re-build)');
            return;
        }

        const pythonPaths = [path.join(ExtensionRootDirectory, 'python_files', 'packages')];
        if (Array.isArray(startupInfo.PYTHONPATHs)) {
            pythonPaths.push(...startupInfo.PYTHONPATHs);
        }
        const PYTHONPATH = pythonPaths.join(path.delimiter);
        const module = startupInfo.module;
        const program = startupInfo.program;
        return {
            name: `Debug ${ApplicationName} on ${target}`,
            request: 'launch',
            type: 'python',
            module,
            program,
            cwd: startupInfo.cwd,
            env: {
                PYTHONPATH
            },
            console: 'integratedTerminal',
            pathMappings: [
                {
                    localRoot: workspaceFolderUri.fsPath,
                    remoteRoot: startupInfo.sourceRoot
                }
            ]
        };
    }
    public async debug(workspaceFolderUri: Uri, target: Target): Promise<boolean> {
        const workspaceFolder = this.serviceContainer.get<IWorkspaceService>(IWorkspaceService).getWorkspaceFolder(workspaceFolderUri);
        if (!workspaceFolder) {
            return false;
        }
        const projectServicec = this.serviceContainer.get<IProjectService>(IProjectService);
        if (!await projectServicec.checkAndInstallModule('ptvsd', workspaceFolderUri)) {
            return false;
        }

        const debugConfig = await this.getDebugConfiguration(workspaceFolderUri, target);
        if (!debugConfig) {
            return false;
        }
        return debug.startDebugging(workspaceFolder, debugConfig);
    }
}
