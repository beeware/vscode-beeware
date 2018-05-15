import * as path from 'path';

export class BeeWareExecutionHelper {
    public buildExecutionArgs(pythonPath: string, beewarePath: string): { command: string; args: string[] } {
        if (path.basename(beewarePath) === beewarePath) {
            return { command: pythonPath, args: ['-m', beewarePath] };
        } else {
            return { command: beewarePath, args: [] };
        }
    }
}
