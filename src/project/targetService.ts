import { injectable } from 'inversify';
import { Target } from '../tasks/types';
import { ITargetService } from './types';

@injectable()
export class TargetService implements ITargetService {
    public getDirectory(target: Target): string {
        switch (target) {
            case Target.android: return 'android';
            case Target.django: return 'django';
            case Target.iOS: return 'iOS';
            case Target.linux: return 'linux';
            case Target.macOS: return 'macOS';
            case Target.tvOS: return 'tvOS';
            case Target.watchOS: return 'watchOS';
            case Target.windows: return 'windows';
            default: {
                throw new Error(`Unsupported target ${target}`);
            }
        }
    }
}
