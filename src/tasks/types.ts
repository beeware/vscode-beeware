export const IContextInitialization = Symbol('IContextInitialization');
export interface IContextInitialization {
    initialize(): Promise<{}>;
}
export const ITaskProvider = Symbol('ITaskProvider');
export interface ITaskProvider {
    initialize(): Promise<void>;
}
