export const IDisposableRegistry = Symbol('IDiposableRegistry');

export const IOutputChannel = Symbol('IOutputChannel');

export const ILogger = Symbol('ILogger');

export interface ILogger {
    error(message: string, error?: Error): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
}
