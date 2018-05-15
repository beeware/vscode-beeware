import { inject, injectable } from 'inversify';
import { CancellationToken } from 'vscode';
import { IApplicationShell } from '../common/application/types';
import { IServiceContainer } from '../ioc/types';
import { IUi } from './types';

@injectable()
export class Ui implements IUi {
    private readonly shell: IApplicationShell;
    constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        this.shell = serviceContainer.get<IApplicationShell>(IApplicationShell);
    }
    public async selectOption(description: string, defaultValue: string, options: string[], token?: CancellationToken): Promise<string> {
        return this.shell.showQuickPick(options, { placeHolder: description, ignoreFocusOut: true }, token)
            .then((item) => item ? item : defaultValue);
    }
    public async selectYesNo(description: string, defaultValue: boolean, token?: CancellationToken): Promise<boolean> {
        return this.shell.showQuickPick(['Yes', 'No'], { placeHolder: description, ignoreFocusOut: true }, token)
            .then((item) => typeof item === 'string' ? item === 'Yes' : defaultValue);
    }
    public async provideValue(description: string, defaultValue: string, token?: CancellationToken): Promise<string> {
        return this.shell.showInputBox({ placeHolder: description, value: defaultValue, ignoreFocusOut: true, prompt: description }, token)
            .then((item) => item && item.length > 0 ? item : defaultValue);
    }
}
