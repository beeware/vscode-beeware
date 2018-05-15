import { inject, injectable } from 'inversify';
import * as path from 'path';
import { Uri } from 'vscode';
import { ExtensionRootDirectory } from '../common/constants';
import { ICurrentProcess, IPythonExecutionFactory, IPythonExecutionService } from '../common/process/types';
import { ILogger } from '../common/types';
import { Variables } from '../cookieCutter/types';
import { IServiceContainer } from '../ioc/types';
import { ITemplateEngine } from './types';

@injectable()
export class TemplateEngine implements ITemplateEngine {
    private readonly executionServiceFactory: IPythonExecutionFactory;
    private readonly currentProcess: ICurrentProcess;
    private readonly executionService: Map<string, IPythonExecutionService>;
    private readonly logger: ILogger;
    constructor(@inject(IServiceContainer) serviceContainer: IServiceContainer) {
        this.executionServiceFactory = serviceContainer.get<IPythonExecutionFactory>(IPythonExecutionFactory);
        this.currentProcess = serviceContainer.get<ICurrentProcess>(ICurrentProcess);
        this.logger = serviceContainer.get<ILogger>(ILogger);
        this.executionService = new Map<string, IPythonExecutionService>();
    }
    public async render(template: string, variables: Variables, workspaceFolder: Uri): Promise<string> {
        return this.renderInternal(variables, workspaceFolder, template);
    }
    public renderFile(templateFile: string, variables: Variables, workspaceFolder: Uri): Promise<string> {
        return this.renderInternal(variables, workspaceFolder, undefined, templateFile);
    }
    public async renderInternal(variables: Variables, workspaceFolder: Uri, template?: string, templateFile?: string): Promise<string> {
        if (templateFile) {
            this.logger.info(`Rendering tempalte file '${templateFile}'`);
        } else {
            this.logger.info(`Rendering tempalte '${template!.substring(0, 50)}...'`);
        }
        if (!this.executionService.has(workspaceFolder.fsPath)) {
            this.executionService.set(workspaceFolder.fsPath, await this.executionServiceFactory.create({ resource: workspaceFolder }));
        }
        const executionService = this.executionService.get(workspaceFolder.fsPath)!;
        const PYTHONPATH = path.join(ExtensionRootDirectory, 'python_files');
        const file = path.join(ExtensionRootDirectory, 'python_files', 'render_template.py');
        // When using templates within variable, we look for items prefixed with `cookiecutter.`
        // This will be used when rendering the templates
        const cookiecutter: { [key: string]: string } = {};
        Object.keys(variables).forEach(key => {
            cookiecutter[key] = variables[key];
        });
        const input = { template_vars: { ...variables, cookiecutter }, content: template, file: templateFile };
        const processEnv = this.currentProcess.env;
        const output = await executionService.exec([file, JSON.stringify(input)], { env: { PYTHONPATH, ...processEnv }, throwOnStdErr: true });
        return output.stdout;
    }
}
