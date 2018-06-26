import { inject, injectable } from 'inversify';
import { IWorkspaceService } from '../common/application/types';
import { IPlatformService } from '../common/platform/types';
import { IServiceContainer } from '../ioc/types';
import { IProjectService } from '../project/types';
import { ITaskProvider, Target } from './types';

@injectable()
export class BulidRunTaskProvider implements ITaskProvider {
    private readonly project: IProjectService;
    private readonly workspaceService: IWorkspaceService;
    private readonly platform: IPlatformService;
    constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        this.project = serviceContainer.get<IProjectService>(IProjectService);
        this.workspaceService = serviceContainer.get<IWorkspaceService>(IWorkspaceService);
        this.platform = serviceContainer.get<IPlatformService>(IPlatformService);
    }
    public getDefaultTarget(): Target {
        if (this.platform.isLinux) {
            return Target.linux;
        } else if (this.platform.isMac) {
            return Target.macOS;
        } else if (this.platform.isWindows) {
            return Target.windows;
        } else {
            throw new Error('Unable to determine default build target');
        }
    }
    public async build(target: Target): Promise<void> {
        const workspaceFolder = await this.workspaceService.selectWorkspaceFolder();
        if (!workspaceFolder) {
            return;
        }
        this.project.build(workspaceFolder.uri, target).ignoreErrors();
    }
    public async run(target: Target): Promise<void> {
        const workspaceFolder = await this.workspaceService.selectWorkspaceFolder();
        if (!workspaceFolder) {
            return;
        }
        this.project.run(workspaceFolder.uri, target).ignoreErrors();
    }
}
