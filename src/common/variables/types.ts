// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/**
 * An interface for a JavaScript object that
 * acts as a dictionary. The keys are strings.
 */
export interface IStringDictionary<V> {
    [name: string]: V;
}

export interface ISystemVariables {
    resolve(value: string): string;
    resolve(value: string[]): string[];
    resolve(value: IStringDictionary<string>): IStringDictionary<string>;
    resolve(value: IStringDictionary<string[]>): IStringDictionary<string[]>;
    resolve(value: IStringDictionary<IStringDictionary<string>>): IStringDictionary<IStringDictionary<string>>;
    resolveAny<T>(value: T): T;
    // tslint:disable-next-line:no-any
    [key: string]: any;
}
