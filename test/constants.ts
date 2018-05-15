// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export const IS_APPVEYOR = process.env.APPVEYOR === 'true';
export const IS_TRAVIS = process.env.TRAVIS === 'true';
export const IS_CI_SERVER = IS_TRAVIS || IS_APPVEYOR;
