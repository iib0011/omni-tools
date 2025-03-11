import { gifTools } from './gif';
import { tool as trimVideo } from './trim/meta';

export const videoTools = [...gifTools, trimVideo];
