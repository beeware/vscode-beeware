import { inject, injectable } from 'inversify';
import { ICommandManager } from '../common/application/types';
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
            { command: 'beeware.buildWindows', target: 'windows' },
            { command: 'beeware.buildMac', target: 'macos' },
            { command: 'beeware.buildLinux', target: 'linux' },
            { command: 'beeware.buildIOS', target: 'ios' },
            { command: 'beeware.buildAndroid', target: 'android' }
        ];

        buildItems.forEach(item => this.commandManager.registerCommand(item.command, () => this.build(item.target)));
        const runItems: Info[] = [
            { command: 'beeware.runWindows', target: 'windows' },
            { command: 'beeware.runMac', target: 'macos' },
            { command: 'beeware.runLinux', target: 'linux' },
            { command: 'beeware.runIOS', target: 'ios' },
            { command: 'beeware.runAndroid', target: 'android' }
        ];

        runItems.forEach(item => this.commandManager.registerCommand(item.command, () => this.run(item.target)));
    }
    public async build(target: Target): Promise<void> {
        this.serviceContainer.get<ITaskProvider>(ITaskProvider).build(target);
    }
    public async run(target: Target): Promise<void> {
        this.serviceContainer.get<ITaskProvider>(ITaskProvider).run(target);
    }
}
