import { inject, injectable } from 'inversify';
import { CancellationToken, Uri } from 'vscode';
import { IFileSystem } from '../common/platform/types';
import { ILogger } from '../common/types';
import { IServiceContainer } from '../ioc/types';
import { ITemplateEngine } from '../templates/types';
import { IUi, IVariableService, VariableDefinitions, Variables } from './types';

enum VariableType {
    value = 'value',
    choise = 'choise',
    yesno = 'yesno'
}

@injectable()
export class VariablesService implements IVariableService {
    private ui: IUi;
    private fileSystem: IFileSystem;
    private readonly templateEngine: ITemplateEngine;
    private readonly logger: ILogger;
    constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        this.ui = serviceContainer.get<IUi>(IUi);
        this.fileSystem = serviceContainer.get<IFileSystem>(IFileSystem);
        this.templateEngine = serviceContainer.get<ITemplateEngine>(ITemplateEngine);
        this.logger = serviceContainer.get<ILogger>(ILogger);
    }
    public async getVariableDefinitions(filePath: string): Promise<VariableDefinitions> {
        const content = await this.fileSystem.readFile(filePath);
        return JSON.parse(content) as VariableDefinitions;
    }

    public async generateVariables(definitions: VariableDefinitions, workspaceFolder: Uri, token: CancellationToken): Promise<Variables> {
        const variables: { [key: string]: string } = {};
        for (const key of Object.keys(definitions)) {
            if (token.isCancellationRequested) {
                continue;
            }
            const keyValue = definitions[key];
            try {
                variables[key] = await this.getUserValue(key, keyValue, token);
            } catch (ex) {
                this.logger.error(`Error in generating variable for '${key}'`, ex);
            }
        }

        // Now go through and find variables that need to be resolved.
        const keys = Object.keys(variables)
            .filter(key => variables[key].indexOf('}}') > variables[key].indexOf('{{'));
        for (const key of keys) {
            if (token.isCancellationRequested) {
                continue;
            }
            variables[key] = await this.templateEngine.render(variables[key], variables, workspaceFolder);
        }

        return variables;
    }
    private getDisplayName(key: string) {
        return key
            .split('_')
            .map((item, index) => index === 0 && item.length > 0 ? `${item.substring(0, 1).toUpperCase()}${item.substring(1)}` : item)
            .join(' ');
    }
    private async getUserValue(key: string, keyValue: string | string[], token?: CancellationToken) {
        // If the key is using existing variables, then do not display a prompt.
        if (typeof keyValue === 'string' && keyValue.indexOf('{{') >= 0) {
            return keyValue;
        }
        const displayName = this.getDisplayName(key);
        const variableType = this.getVariableType(keyValue);
        switch (variableType) {
            case VariableType.yesno: {
                const value = await this.ui.selectYesNo(displayName, keyValue === 'y', token);
                return value ? 'y' : 'n';
            }
            case VariableType.choise: {
                const options = keyValue as string[];
                return this.ui.selectOption(displayName, options[0], options, token);
            }
            default: {
                return this.ui.provideValue(`Provide a value for '${displayName}'`, keyValue as string, token);
            }
        }
    }
    private getVariableType(value: string | string[]): VariableType {
        if (Array.isArray(value)) {
            return VariableType.choise;
        } else if (['yes', 'no', 'y', 'n', 'true', 'false', '1', '0'].indexOf(value) >= 0) {
            return VariableType.yesno;
        } else {
            return VariableType.value;
        }
    }
}
