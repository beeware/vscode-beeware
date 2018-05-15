// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import { inject, injectable } from 'inversify';
import { Uri } from 'vscode';
import { IServiceContainer } from '../../ioc/types';
import { ProcessService } from './proc';
import { IBufferDecoder, IProcessService, IProcessServiceFactory } from './types';

@injectable()
export class ProcessServiceFactory implements IProcessServiceFactory {
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer) {
    }
    public async create(_resource?: Uri): Promise<IProcessService> {
        const decoder = this.serviceContainer.get<IBufferDecoder>(IBufferDecoder);
        return new ProcessService(decoder);
    }
}
