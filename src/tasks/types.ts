export const IContextInitialization = Symbol('IContextInitialization');
export interface IContextInitialization {
    initialize(): Promise<{}>;
}
export enum Target {
    windows = 'windows',
    macOS = 'macOS',
    linux = 'linux',
    iOS = 'iOS',
    android = 'android',
    django = 'django',
    tvOS = 'tvOS',
    watchOS = 'watchOS'
}

export const ITaskProvider = Symbol('ITaskProvider');
export interface ITaskProvider {
    getDefaultTarget(): Target;
    build(target: Target): Promise<void>;
    run(target: Target): Promise<void>;
}
export const ITaskCommands = Symbol('ITaskCommands');

export interface ITaskCommands {
    register(): void;
}
