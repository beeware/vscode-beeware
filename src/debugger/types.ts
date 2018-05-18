import { Uri } from 'vscode';
import { Target } from '../tasks/types';

export type DebugInfo = { port: number };

export const IDebugger = Symbol('ILauncher');
export interface IDebugger {
    debug(workspaceFolder: Uri, target: Target): Promise<boolean>;
}
