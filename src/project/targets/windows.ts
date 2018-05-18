import { inject, injectable } from 'inversify';
import * as path from 'path';
import { Uri } from 'vscode';
import { IServiceContainer } from '../../ioc/types';
import { Target } from '../../tasks/types';
import { IProjectService, IStartupService, ITargetService, StartupInfo } from '../types';

@injectable()
export class StartupService implements IStartupService {
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer) { }
    public async getStarupInfo(workspaceFolder: Uri, target: Target): Promise<StartupInfo | undefined> {
        const projectInfo = await this.serviceContainer.get<IProjectService>(IProjectService).getProjectInfo(workspaceFolder);
        if (!projectInfo) {
            return;
        }

        const targetDirectoryName = this.serviceContainer.get<ITargetService>(ITargetService).getDirectory(target);
        const cwd = workspaceFolder.fsPath;
        const program = path.join(workspaceFolder.fsPath, 'setup.py');
        const args = ['windows', '-s']
        const sourceRoot = path.join(workspaceFolder.fsPath, targetDirectoryName, 'content', 'app')
        
        return {
            cwd,
            program,
            args,
            sourceRoot
        };
    }
}
