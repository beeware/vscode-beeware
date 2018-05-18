import { Uri } from 'vscode';
import { Target } from '../tasks/types';

export type ProjectInfo = SetupInfo;
export type StartupInfo = {
    sourceRoot: string;
    cwd: string;
    PYTHONPATHs?: string[];
    program?: string;
    module?: string;
};
export const IProjectService = Symbol('IProject');

export interface IProjectService {
    create(workspaceFolder: Uri): Promise<void>;
    getProjectInfo(workspaceFolder: Uri): Promise<ProjectInfo | undefined>;
    getStartupInfo(workspaceFolder: Uri, target: Target): Promise<StartupInfo | undefined>;
    build(workspaceFolder: Uri, target: Target): Promise<void>;
    run(workspaceFolder: Uri, target: Target): Promise<void>;
}

export const IProjectCommand = Symbol('IProjectCommand');

export interface IProjectCommand {
    register(): void;
}

export type SetupInfo = { name: string; formalName: string };
export const ISetupService = Symbol('ISetupParser');
export interface ISetupService {
    parseSetup(workspaceUri: Uri): Promise<SetupInfo | undefined>;
}

export interface IStartupService {
    getStarupInfo(workspaceFolder: Uri, target: Target): Promise<StartupInfo | undefined>;
}

export const ITargetService = Symbol('ITargetService');
export interface ITargetService {
    getDirectory(target: Target): string;
}
