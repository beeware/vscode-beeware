// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import {
    CancellationToken, ConfigurationChangeEvent, Event, FileSystemWatcher, GlobPattern, TextDocument, Uri,
    window, workspace, WorkspaceConfiguration, WorkspaceFolder, WorkspaceFoldersChangeEvent
} from 'vscode';
import { IApplicationShell, IWorkspaceService } from './types';

@injectable()
export class WorkspaceService implements IWorkspaceService {
    constructor(@inject(IApplicationShell) private shell: IApplicationShell) { }
    public get onDidChangeConfiguration(): Event<ConfigurationChangeEvent> {
        return workspace.onDidChangeConfiguration;
    }
    public get rootPath(): string | undefined {
        return Array.isArray(workspace.workspaceFolders) ? workspace.workspaceFolders[0].uri.fsPath : undefined;
    }
    public get workspaceFolders(): WorkspaceFolder[] | undefined {
        return workspace.workspaceFolders;
    }
    public get onDidChangeWorkspaceFolders(): Event<WorkspaceFoldersChangeEvent> {
        return workspace.onDidChangeWorkspaceFolders;
    }
    public get hasWorkspaceFolders() {
        return Array.isArray(workspace.workspaceFolders) && workspace.workspaceFolders.length > 0;
    }
    public getConfiguration(section?: string, resource?: Uri): WorkspaceConfiguration {
        return workspace.getConfiguration(section, resource);
    }
    public getWorkspaceFolder(uri: Uri): WorkspaceFolder | undefined {
        return workspace.getWorkspaceFolder(uri);
    }
    public asRelativePath(pathOrUri: string | Uri, includeWorkspaceFolder?: boolean): string {
        return workspace.asRelativePath(pathOrUri, includeWorkspaceFolder);
    }
    public createFileSystemWatcher(globPattern: GlobPattern, ignoreCreateEvents?: boolean, ignoreChangeEvents?: boolean, ignoreDeleteEvents?: boolean): FileSystemWatcher {
        return workspace.createFileSystemWatcher(globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents);
    }
    public findFiles(include: GlobPattern, exclude?: GlobPattern, maxResults?: number, token?: CancellationToken): Thenable<Uri[]> {
        return workspace.findFiles(include, exclude, maxResults, token);
    }
    public get onDidSaveTextDocument(): Event<TextDocument> {
        return workspace.onDidSaveTextDocument;
    }
    public async selectWorkspaceFolder(): Promise<WorkspaceFolder | undefined> {
        if (!this.hasWorkspaceFolders) {
            await this.shell.showErrorMessage('Please open a workspace folder');
            return;
        } else if (workspace.workspaceFolders!.length === 1) {
            return workspace.workspaceFolders![0];
        } else {
            return window.showWorkspaceFolderPick({ placeHolder: 'Select a workspace folder' });
        }
    }
}
