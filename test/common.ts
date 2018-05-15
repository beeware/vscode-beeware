import * as fs from 'fs-extra';
export const PYTHON_PATH = getPythonPath();

function getPythonPath(): string {
    // tslint:disable-next-line:no-unsafe-any
    if (process.env.TRAVIS_PYTHON_PATH && fs.existsSync(process.env.TRAVIS_PYTHON_PATH)) {
        // tslint:disable-next-line:no-unsafe-any
        return process.env.TRAVIS_PYTHON_PATH;
    }
    return 'python';
}
