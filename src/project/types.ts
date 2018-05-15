import { Uri } from 'vscode';

export const IProject = Symbol('IProject');

export interface IProject {
    create(workspaceFolder: Uri): Promise<void>;
}

export const IProjectCommand = Symbol('IProjectCommand');

export interface IProjectCommand {
    register(): void;
}
