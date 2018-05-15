import { CancellationToken, Uri } from 'vscode';

export const IVariableService = Symbol('IVariableGenerator');

export type Variables = {
    readonly [key: string]: string;
};

export type VariableDefinitions = {
    readonly [key: string]: string | string[];
};

export interface IVariableService {
    getVariableDefinitions(filePath: string): Promise<VariableDefinitions>;
    generateVariables(definitions: VariableDefinitions, workspaceFolder: Uri, token: CancellationToken): Promise<Variables>;
}

export const ITemplateIterator = Symbol('ITemplateIterator');

export type TemplateItem = {
    type: 'file' | 'folder';
    path: string;
};

export interface ITemplateIterator {
    getTemplates(): Promise<TemplateItem[]>;
}

export const IInstaller = Symbol('IInstaller');

export interface IInstaller {
    install(workspaceFolder: Uri): Promise<boolean>;
}

export const ICookiecutter = Symbol('ICookiecutter');

export interface ICookiecutter {
    create(workspaceFolder: Uri): Promise<void>;
}
export const IUi = Symbol('IUi');

export interface IUi {
    selectOption(description: string, defaultValue: string, options: string[]): Promise<string>;
    selectYesNo(description: string, defaultValue: boolean): Promise<boolean>;
    provideValue(description: string, defaultValue: string): Promise<string>;
}
