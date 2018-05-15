// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ChildProcess, SpawnOptions as ChildProcessSpawnOptions } from 'child_process';
import { Observable } from 'rxjs';
import { CancellationToken, Uri } from 'vscode';

export const ICurrentProcess = Symbol('ICurrentProcess');
export interface ICurrentProcess {
    readonly env: NodeJS.ProcessEnv;
    readonly argv: string[];
    readonly stdout: NodeJS.WriteStream;
    readonly stdin: NodeJS.ReadStream;
    on(event: string | symbol, listener: Function): this;
}

export type ExecutionInfo = {
    execPath?: string;
    moduleName?: string;
    args: string[];
};

export const IBufferDecoder = Symbol('IBufferDecoder');
export interface IBufferDecoder {
    decode(buffers: Buffer[], encoding: string): string;
}

export type Output = {
    source: 'stdout' | 'stderr';
    out: string;
};
export type ObservableExecutionResult = {
    proc: ChildProcess;
    out: Observable<Output>;
};

export type SpawnOptions = ChildProcessSpawnOptions & {
    encoding?: string;
    token?: CancellationToken;
    mergeStdOutErr?: boolean;
    throwOnStdErr?: boolean;
};

export type ExecutionResult = {
    stdout: string;
    stderr?: string;
};

export interface IProcessService {
    execObservable(file: string, args: string[], options?: SpawnOptions): ObservableExecutionResult;
    exec(file: string, args: string[], options?: SpawnOptions): Promise<ExecutionResult>;
}

export const IProcessServiceFactory = Symbol('IProcessServiceFactory');

export interface IProcessServiceFactory {
    create(resource?: Uri): Promise<IProcessService>;
}

export const IPythonExecutionFactory = Symbol('IPythonExecutionFactory');
export type ExecutionFactoryCreationOptions = {
    resource?: Uri;
    pythonPath?: string;
};
export interface IPythonExecutionFactory {
    create(options: ExecutionFactoryCreationOptions): Promise<IPythonExecutionService>;
}

export const IPythonExecutionService = Symbol('IPythonExecutionService');

export interface IPythonExecutionService {
    isModuleInstalled(moduleName: string): Promise<boolean>;
    exec(args: string[], options: SpawnOptions): Promise<ExecutionResult>;
    execModule(moduleName: string, args: string[], options: SpawnOptions): Promise<ExecutionResult>;
}

export const IModuleInstaller = Symbol('IModuleInstaller');

export interface IModuleInstaller {
    isInstalled(moduleName: string, workspaceFolder: Uri): Promise<boolean>;
    install(moduleName: string, workspaceFolder: Uri, targetDirectory?: string): Promise<boolean>;
}
