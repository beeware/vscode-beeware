import { Uri } from 'vscode';

export const IProject = Symbol('IProject');

export interface IProject {
    create(workspaceFolder: Uri): Promise<void>;
}

export const ICommandHandler = Symbol('ICommandHandler');

export interface ICommandHandler {
    register(): void;
}
