import { rotate } from '../string/rotate/service';
import { gifTools } from './gif';
import { tool as trimVideo } from './trim/meta';
import { tool as rotateVideo } from './rotate/meta';
import { tool as compressVideo } from './compress/meta';

export const videoTools = [...gifTools, trimVideo, rotateVideo, compressVideo];
