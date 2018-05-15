import { Uri } from 'vscode';

export const IConfigurationService = Symbol('IConfigurationService');

export interface IConfigurationService {
    getSettings(resource?: Uri): IBeeWareSettings;
}

export const IBeeWareSettings = Symbol('IBeeWareSettings');

export interface IBeeWareSettings {
    beewarePath: string;
    pythonPath: string;
    cookiecutterTemplateRepoUrl: string;
}
