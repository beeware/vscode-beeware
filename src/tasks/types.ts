export const IContextInitialization = Symbol('IContextInitialization');
export interface IContextInitialization {
    initialize(): Promise<{}>;
}
export type Target = 'windows' | 'macos' | 'linux' | 'ios' | 'android';
export const ITaskProvider = Symbol('ITaskProvider');
export interface ITaskProvider {
    build(target: Target): Promise<void>;
    run(target: Target): Promise<void>;
}
export const ITaskCommands = Symbol('ITaskCommands');

export interface ITaskCommands {
    register(): void;
}
