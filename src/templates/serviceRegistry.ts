import { IServiceManager } from '../ioc/types';
import { TemplateEngine } from './engine';
import { ITemplateEngine } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<ITemplateEngine>(ITemplateEngine, TemplateEngine);
}
