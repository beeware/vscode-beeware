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

        const targetDirectory = this.serviceContainer.get<ITargetService>(ITargetService).getDirectory(target);
        const contentDirectory = path.join(workspaceFolder.fsPath, targetDirectory, 'content');
        const cwd = path.join(contentDirectory, 'app');
        const program = path.join(contentDirectory, 'app', 'start.py');
        const sourceRoot = path.join(contentDirectory, 'app');

        return {
            cwd,
            program,
            sourceRoot
        };
    }
}
