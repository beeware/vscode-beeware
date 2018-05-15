import { inject, injectable } from 'inversify';
import { Uri } from 'vscode';
import { ICookiecutter } from '../cookieCutter/types';
import { IServiceContainer } from '../ioc/types';
import { IProject } from './types';

@injectable()
export class Project implements IProject {
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer) {
    }
    public async create(workspaceFolder: Uri): Promise<void> {
        const cookieCutter = this.serviceContainer.get<ICookiecutter>(ICookiecutter);
        return cookieCutter.create(workspaceFolder);
    }
}
