import { DebugConfiguration, DebugConfigurationProvider, Uri } from 'vscode';
import { Target } from '../tasks/types';

export type DebugInfo = { port: number };

export const IDebugger = Symbol('ILauncher');
export interface IDebugger {
    getDebugConfiguration(workspaceFolderUri: Uri, target: Target, build: boolean): Promise<DebugConfiguration | undefined>;
    debug(workspaceFolder: Uri, target: Target): Promise<boolean>;
}

export const IDebugConfigurationProvider = Symbol('IDebugConfigurationProvider');

export interface IDebugConfigurationProvider extends DebugConfigurationProvider {
}
