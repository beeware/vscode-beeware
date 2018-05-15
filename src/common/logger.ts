import { inject, injectable } from 'inversify';
import { OutputChannel } from 'vscode';
import { IServiceContainer } from '../ioc/types';
import { ApplicationName } from './constants';
import { ILogger, IOutputChannel } from './types';

const PREFIX = `${ApplicationName}: `;

@injectable()
export class Logger implements ILogger {
    private readonly outputChannel: OutputChannel;
    constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        this.outputChannel = serviceContainer.get<OutputChannel>(IOutputChannel);
    }
    public error(message: string, ex?: Error) {
        console.error(`${PREFIX}${message}`, ex);
        this.outputChannel.appendLine(message);
    }
    public warn(message: string) {
        console.warn(`${PREFIX}${message}`);
        this.outputChannel.appendLine(message);
    }
    public info(message: string) {
        this.outputChannel.appendLine(message);
    }
}
