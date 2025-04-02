import { tool as pngCrop } from './crop/meta';
import { tool as pngCompressPng } from './compress-png/meta';
import { tool as convertJgpToPng } from './convert-jgp-to-png/meta';
import { tool as pngCreateTransparent } from './create-transparent/meta';
import { tool as changeOpacity } from './change-opacity/meta';
import { tool as removeBackground } from './remove-background/meta';

export const pngTools = [
  pngCompressPng,
  pngCreateTransparent,
  convertJgpToPng,
  changeOpacity,
  pngCrop,
  removeBackground
];
