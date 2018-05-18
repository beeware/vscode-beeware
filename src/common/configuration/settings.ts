'use strict';

import { EventEmitter } from 'events';
import { inject } from 'inversify';
import * as path from 'path';
import { Disposable, Uri, workspace } from 'vscode';
import { IServiceContainer } from '../../ioc/types';
import { IWorkspaceService } from '../application/types';
import { IDisposableRegistry } from '../types';
import { SystemVariables } from '../variables/systemVariables';
import { IBeeWareSettings } from './types';

// tslint:disable-next-line:no-require-imports no-var-requires
const untildify = require('untildify');

export const BEEWARE_PATH = 'beeware';
export const COOKIE_CUTTER_TEMPLATE_REPO_URL = 'https://github.com/pybee/briefcase-template.git';

export class BeeWareSettings extends EventEmitter implements IBeeWareSettings {
    private _beewarePath!: string;
    private _cookiecutterTemplateRepoUrl!: string;
    private _pythonPath!: string;
    private _name?: string;
    private _formalName?: string;
    private systemVariables!: SystemVariables;
    public get beewarePath() {
        return this._beewarePath;
    }
    public get name() {
        return this._name;
    }
    public get formalName() {
        return this._formalName;
    }
    public get cookiecutterTemplateRepoUrl() {
        return this._cookiecutterTemplateRepoUrl;
    }
    public get pythonPath() {
        return this._pythonPath;
    }
    constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer, private readonly workspaceFolder?: Uri) {
        super();
        const workspaceService = serviceContainer.get<IWorkspaceService>(IWorkspaceService);
        const disposables = serviceContainer.get<Disposable[]>(IDisposableRegistry);
        this.systemVariables = new SystemVariables(this.workspaceFolder ? this.workspaceFolder.fsPath : undefined);
        disposables.push(workspaceService.onDidChangeConfiguration(() => {
            this.initializeSettings();

            // If workspace config changes, then we could have a cascading effect of on change events.
            // Let's defer the change notification.
            setTimeout(() => this.emit('change'), 1);
        }));
        this.initializeSettings();
    }
    private initializeSettings() {
        const settings = workspace.getConfiguration('beeware', this.workspaceFolder);
        this._beewarePath = settings.get('beewarePath', BEEWARE_PATH);
        this._name = settings.get('name', undefined);
        this._formalName = settings.get('formalName', undefined);
        this._cookiecutterTemplateRepoUrl = settings.get('cookiecutterTemplateRepoUrl', COOKIE_CUTTER_TEMPLATE_REPO_URL);

        const pythonSettings = workspace.getConfiguration('python', this.workspaceFolder);
        this._pythonPath = pythonSettings.get('pythonPath', 'python');
        this._pythonPath = this.systemVariables.resolveAny(pythonSettings.get<string>('pythonPath'))!;
        this._pythonPath = this.workspaceFolder ? getAbsolutePath(this.pythonPath, this.workspaceFolder.fsPath) : this._pythonPath;

    }
}

function getAbsolutePath(pathToCheck: string, rootDir: string): string {
    pathToCheck = untildify(pathToCheck) as string;
    if (pathToCheck.indexOf(path.sep) === -1) {
        return pathToCheck;
    }
    return path.isAbsolute(pathToCheck) ? pathToCheck : path.resolve(rootDir, pathToCheck);
}
