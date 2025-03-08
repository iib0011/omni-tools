import { tool as pngCompressPng } from './compress-png/meta';
import { tool as convertJgpToPng } from './convert-jgp-to-png/meta';
import { tool as pngCreateTransparent } from './create-transparent/meta';
import { tool as changeColorsInPng } from './change-colors-in-png/meta';
import { tool as changeOpacity } from './change-opacity/meta';

export const pngTools = [
  pngCompressPng,
  pngCreateTransparent,
  changeColorsInPng,
  convertJgpToPng,
  changeOpacity
];
