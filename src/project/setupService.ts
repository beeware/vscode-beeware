import { inject, injectable } from 'inversify';
import * as path from 'path';
import { ConfigurationTarget, Uri } from 'vscode';
import { IApplicationShell } from '../common/application/types';
import { IConfigurationService } from '../common/configuration/types';
import '../common/extensions';
import { IFileSystem } from '../common/platform/types';
import { IPythonExecutionFactory } from '../common/process/types';
import { ILogger } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { ISetupService, SetupInfo } from './types';

@injectable()
export class SetupService implements ISetupService {
    private readonly logger: ILogger;
    private readonly appShell: IApplicationShell;
    private readonly configurationService: IConfigurationService;
    private readonly fileSystem: IFileSystem;
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer) {
        this.logger = this.serviceContainer.get<ILogger>(ILogger);
        this.appShell = this.serviceContainer.get<IApplicationShell>(IApplicationShell);
        this.configurationService = this.serviceContainer.get<IConfigurationService>(IConfigurationService);
        this.fileSystem = this.serviceContainer.get<IFileSystem>(IFileSystem);
    }
    public async parseSetup(workspaceUri: Uri): Promise<SetupInfo | undefined> {
        const info = await this.getSetupInfoFromConfig(workspaceUri);
        let name = info && info.name ? info.name : undefined;
        if (!name) {
            name = await this.getName(workspaceUri);
            if (!name) {
                return;
            }
        }

        let formalName = info && info.formalName ? info.formalName : undefined;
        if (!formalName) {
            formalName = await this.getFormalName(workspaceUri);
            if (!formalName) {
                return;
            }
        }

        return { formalName, name };
    }

    private async getSetupInfoFromConfig(workspaceUri: Uri): Promise<Partial<SetupInfo> | undefined> {
        const settings = this.configurationService.getSettings(workspaceUri);
        const name = settings.name;
        const formalName = settings.formalName;
        if (!name && !formalName) {
            return;
        }
        return { name, formalName };
    }

    private async getName(workspaceUri: Uri): Promise<string | undefined> {
        const pythonExecFactory = this.serviceContainer.get<IPythonExecutionFactory>(IPythonExecutionFactory);
        const pythonExec = await pythonExecFactory.create({ resource: workspaceUri });
        try {
            const output = await pythonExec.exec(['setup.py', '--name'], { cwd: workspaceUri.fsPath });
            if (output.stdout.trim().length > 0) {
                return output.stdout.trim();
            }
        } catch {
            this.logger.info('Failed to get name from setup.py using the command \'python setup.py --name\'');
        }

        const name = await this.appShell.showInputBox({ prompt: 'Please enter the App Name (found in setup.py)' });
        if (name) {
            await this.configurationService.updateSettingAsync('name', name, workspaceUri, ConfigurationTarget.Workspace);
        }
        return name;
    }
    private async getFormalName(workspaceUri: Uri): Promise<string | undefined> {
        // Ok parse the setup.py file and get it from there.
        const setupFile = path.join(workspaceUri.fsPath, 'setup.py');
        if (await this.fileSystem.fileExists(setupFile)) {
            try {
                const content = await this.fileSystem.readFile(setupFile);
                const lines = content.splitLines({ removeEmptyEntries: true, trim: true });
                for (const line of lines.map(item => item.trim()).filter(item => item.indexOf('formal_name') === 1 && item.indexOf(':') > 1 && item.trim().endsWith(','))) {
                    const value = line.split(':')[1].trim().slice(0, -1).trim().substring(1).slice(0, -1);
                    if (value.length > 0) {
                        return value;
                    }
                }
            } catch (ex) {
                this.logger.error('Failed to parse setup.py to get formal_name', ex);
            }
        }

        const formalName = await this.appShell.showInputBox({ prompt: 'Please enter the Formal Name (found in setup.py)' });
        if (formalName) {
            await this.configurationService.updateSettingAsync('formalName', formalName, workspaceUri, ConfigurationTarget.Workspace);
        }
        return formalName;
    }

}
