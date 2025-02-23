import { tool as convertJgpToPng } from './convert-jgp-to-png/meta';
import { tool as pngCreateTransparent } from './create-transparent/meta';
import { tool as changeColorsInPng } from './change-colors-in-png/meta';

export const pngTools = [
  changeColorsInPng,
  pngCreateTransparent,
  convertJgpToPng
];
