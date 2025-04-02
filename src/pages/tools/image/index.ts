import { pngTools } from './png';
import { imageGenericTools } from './generic';

export const imageTools = [...imageGenericTools, ...pngTools];
