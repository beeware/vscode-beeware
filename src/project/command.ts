import { inject, injectable } from 'inversify';
import { ICommandManager, IWorkspaceService } from '../common/application/types';
import { ICookiecutter } from '../cookieCutter/types';
import { IServiceContainer } from '../ioc/types';
import { IProjectCommand } from './types';

@injectable()
export class ProjectCommand implements IProjectCommand {
    private readonly commandManager: ICommandManager;
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer) {
        this.commandManager = serviceContainer.get<ICommandManager>(ICommandManager);
    }
    public register(): void {
        this.commandManager.registerCommand('beeware.createProject', () => this.createProject());
    }

    private async createProject() {
        const cookieCutter = this.serviceContainer.get<ICookiecutter>(ICookiecutter);
        const workspaceServivce = this.serviceContainer.get<IWorkspaceService>(IWorkspaceService);
        const workspaceFolder = await workspaceServivce.selectWorkspaceFolder();
        if (!workspaceFolder) {
            return false;
        }
        return cookieCutter.create(workspaceFolder.uri);
    }
}
