// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject } from 'inversify';
import { Disposable, Event, EventEmitter, Terminal } from 'vscode';
import '../../common/extensions';
import { IServiceContainer } from '../../ioc/types';
import { ITerminalManager } from '../application/types';
import { IDisposableRegistry } from '../types';
import { ITerminalHelper, ITerminalService, TerminalShellType } from './types';

export class TerminalService implements ITerminalService, Disposable {
    private terminal?: Terminal;
    private terminalShellType!: TerminalShellType;
    private terminalClosed = new EventEmitter<void>();
    private terminalManager: ITerminalManager;
    private terminalHelper: ITerminalHelper;
    public get onDidCloseTerminal(): Event<void> {
        return this.terminalClosed.event;
    }
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer,
        private title: string = 'Python') {

        const disposableRegistry = this.serviceContainer.get<Disposable[]>(IDisposableRegistry);
        disposableRegistry.push(this);
        this.terminalHelper = this.serviceContainer.get<ITerminalHelper>(ITerminalHelper);
        this.terminalManager = this.serviceContainer.get<ITerminalManager>(ITerminalManager);
        this.terminalManager.onDidCloseTerminal(this.terminalCloseHandler, this, disposableRegistry);
    }
    public dispose() {
        if (this.terminal) {
            this.terminal.dispose();
        }
    }
    public async sendCommand(command: string, args: string[]): Promise<void> {
        await this.ensureTerminal();
        const text = this.terminalHelper.buildCommandForTerminal(this.terminalShellType, command, args);
        this.terminal!.show(true);
        this.terminal!.sendText(text, true);
    }
    public async sendText(text: string): Promise<void> {
        await this.ensureTerminal();
        this.terminal!.show(true);
        this.terminal!.sendText(text);
    }
    public async show(preserveFocus: boolean = true): Promise<void> {
        await this.ensureTerminal(preserveFocus);
        this.terminal!.show(preserveFocus);
    }
    private async ensureTerminal(preserveFocus: boolean = true): Promise<void> {
        if (this.terminal) {
            return;
        }
        const shellPath = this.terminalHelper.getTerminalShellPath();
        this.terminalShellType = !shellPath || shellPath.length === 0 ? TerminalShellType.other : this.terminalHelper.identifyTerminalShell(shellPath);
        this.terminal = this.terminalManager.createTerminal({ name: this.title });

        // Sometimes the terminal takes some time to start up before it can start accepting input.
        await new Promise(resolve => setTimeout(resolve, 100));

        this.terminal!.show(preserveFocus);
    }
    private terminalCloseHandler(terminal: Terminal) {
        if (terminal === this.terminal) {
            this.terminalClosed.fire();
            this.terminal = undefined;
        }
    }
}
