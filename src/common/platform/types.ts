// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as fs from 'fs';

export const IFileSystem = Symbol('IFileSystem');
export interface IFileSystem {
    directorySeparatorChar: string;
    objectExists(path: string, statCheck: (s: fs.Stats) => boolean): Promise<boolean>;
    fileExists(path: string): Promise<boolean>;
    fileExistsSync(path: string): boolean;
    directoryExists(path: string): Promise<boolean>;
    createDirectory(path: string): Promise<void>;
    getSubDirectories(rootDir: string): Promise<string[]>;
    arePathsSame(path1: string, path2: string): boolean;
    readFile(filePath: string): Promise<string>;
    appendFileSync(filename: string, data: {}, encoding: string): void;
    appendFileSync(filename: string, data: {}, options?: { encoding?: string; mode?: number; flag?: string }): void;
    // tslint:disable-next-line:unified-signatures
    appendFileSync(filename: string, data: {}, options?: { encoding?: string; mode?: string; flag?: string }): void;
    getRealPath(path: string): Promise<string>;
    copyFile(src: string, dest: string): Promise<void>;
    deleteFile(filename: string): Promise<void>;
}

export const IPlatformService = Symbol('IPlatformService');
export interface IPlatformService {
    isWindows: boolean;
    isMac: boolean;
    isLinux: boolean;
}
