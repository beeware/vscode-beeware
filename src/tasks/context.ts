import { inject, injectable } from 'inversify';
import { ICommandManager } from '../common/application/types';
import { IPlatformService } from '../common/platform/types';
import { IServiceContainer } from '../ioc/types';
import { IContextInitialization } from './types';

@injectable()
export class ContextInitialization implements IContextInitialization {
    private readonly commandManager: ICommandManager;
    private readonly platform: IPlatformService;
    constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        this.commandManager = serviceContainer.get<ICommandManager>(ICommandManager);
        this.platform = serviceContainer.get<IPlatformService>(IPlatformService);
    }
    public async initialize() {
        return Promise.all([
            this.commandManager.executeCommand('setContext', 'beeware:isWindows', this.platform.isWindows),
            this.commandManager.executeCommand('setContext', 'beeware:isMac', this.platform.isMac),
            this.commandManager.executeCommand('setContext', 'beeware:isLinux', this.platform.isLinux)
        ]);
    }
}
