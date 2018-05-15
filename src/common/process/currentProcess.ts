// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { injectable } from 'inversify';
import { ICurrentProcess } from './types';

@injectable()
export class CurrentProcess implements ICurrentProcess {
    public on = (event: string | symbol, listener: Function): this => {
        // tslint:disable-next-line:no-any
        process.on(event as any, listener as any);
        // tslint:disable-next-line:no-any
        return process as any;
    }
    public get env(): NodeJS.ProcessEnv {
        return process.env;
    }
    public get argv(): string[] {
        return process.argv;
    }
    public get stdout(): NodeJS.WriteStream {
        return process.stdout;
    }
    public get stdin(): NodeJS.ReadStream {
        return process.stdin;
    }
}
