import { inject, injectable } from 'inversify';
import { ICommandManager, IWorkspaceService } from '../common/application/types';
import { IDebugger } from '../debugger/types';
import { IServiceContainer } from '../ioc/types';
import { ITaskCommands, ITaskProvider, Target } from './types';

@injectable()
export class TaskCommands implements ITaskCommands {
    private readonly commandManager: ICommandManager;
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer) {
        this.commandManager = serviceContainer.get<ICommandManager>(ICommandManager);
    }
    public async register() {
        type Info = { command: string; target: Target };
        const buildItems: Info[] = [
            { command: 'beeware.buildWindows', target: Target.windows },
            { command: 'beeware.buildMac', target: Target.macOS },
            { command: 'beeware.buildLinux', target: Target.linux },
            { command: 'beeware.buildIOS', target: Target.iOS },
            { command: 'beeware.buildAndroid', target: Target.android }
        ];
        buildItems.forEach(item => this.commandManager.registerCommand(item.command, () => this.build(item.target)));

        const runItems: Info[] = [
            { command: 'beeware.runWindows', target: Target.windows },
            { command: 'beeware.runMac', target: Target.macOS },
            { command: 'beeware.runLinux', target: Target.linux },
            { command: 'beeware.runIOS', target: Target.iOS },
            { command: 'beeware.runAndroid', target: Target.android }
        ];
        runItems.forEach(item => this.commandManager.registerCommand(item.command, () => this.run(item.target)));

        const debugItems: Info[] = [
            { command: 'beeware.debugWindows', target: Target.windows },
            { command: 'beeware.debugMac', target: Target.macOS },
            { command: 'beeware.debugLinux', target: Target.linux },
            { command: 'beeware.debugIOS', target: Target.iOS },
            { command: 'beeware.debugAndroid', target: Target.android }
        ];
        debugItems.forEach(item => this.commandManager.registerCommand(item.command, () => this.debug(item.target)));
    }
    public async build(target: Target): Promise<void> {
        this.serviceContainer.get<ITaskProvider>(ITaskProvider).build(target, true);
    }
    public async run(target: Target): Promise<void> {
        this.serviceContainer.get<ITaskProvider>(ITaskProvider).run(target, true);
    }
    public async debug(target: Target): Promise<void> {
        const workspaceFolder = await this.serviceContainer.get<IWorkspaceService>(IWorkspaceService).selectWorkspaceFolder();
        if (!workspaceFolder) {
            return;
        }
        this.serviceContainer.get<IDebugger>(IDebugger).debug(workspaceFolder.uri, target);
    }
}
