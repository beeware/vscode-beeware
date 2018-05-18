import { ConfigurationTarget, Uri } from 'vscode';

export const IConfigurationService = Symbol('IConfigurationService');
export type SettingsProperty = keyof IBeeWareSettings;

export interface IConfigurationService {
    getSettings(resource?: Uri): IBeeWareSettings;
    updateSettingAsync(setting: SettingsProperty, value?: {}, resource?: Uri, configTarget?: ConfigurationTarget): Promise<void>;
}

export const IBeeWareSettings = Symbol('IBeeWareSettings');

export interface IBeeWareSettings {
    beewarePath: string;
    name?: string;
    formalName?: string;
    pythonPath: string;
    cookiecutterTemplateRepoUrl: string;
}
