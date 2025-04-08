import { tool as resizeImage } from './resize/meta';
import { tool as compressImage } from './compress/meta';
import { tool as changeColors } from './change-colors/meta';
import { tool as removeBackground } from './remove-background/meta';
import { tool as cropImage } from './crop/meta';
import { tool as changeOpacity } from './change-opacity/meta';
import { tool as createTransparent } from './create-transparent/meta';
import { tool as imageToText } from './image-to-text/meta';

export const imageGenericTools = [
  resizeImage,
  compressImage,
  removeBackground,
  cropImage,
  changeOpacity,
  changeColors,
  createTransparent,
  imageToText
];
