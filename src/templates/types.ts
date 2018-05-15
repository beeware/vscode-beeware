import { Uri } from 'vscode';
import { Variables } from '../cookieCutter/types';

export const ITemplateEngine = Symbol('ITemplateEngine');

export interface ITemplateEngine {
    render(template: string, variables: Variables, workspaceFolder: Uri): Promise<string>;
    renderFile(template: string, variables: Variables, workspaceFolder: Uri): Promise<string>;
}
