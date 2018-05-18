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
        const targetDirectory = path.join(workspaceFolder.fsPath, targetDirectoryName);
        const cwd = targetDirectory;
        const module = projectInfo.name;
        const sourceRoot = path.join(targetDirectory, 'app');
        const PYTHONPATHs = [path.join(targetDirectory, 'app'), path.join(targetDirectory, 'app_packages')];

        return {
            cwd,
            module,
            sourceRoot,
            PYTHONPATHs
        };
    }
}
