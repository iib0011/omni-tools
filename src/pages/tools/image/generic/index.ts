import { tool as resizeImage } from './resize/meta';
import { tool as compressImage } from './compress/meta';
import { tool as changeColors } from './change-colors/meta';
import { tool as removeBackground } from './remove-background/meta';
import { tool as cropImage } from './crop/meta';
import { tool as changeOpacity } from './change-opacity/meta';
import { tool as createTransparent } from './create-transparent/meta';
import { tool as imageToText } from './image-to-text/meta';
import { tool as qrCodeGenerator } from './qr-code/meta';
import { tool as rotateImage } from './rotate/meta';
import { tool as convertToJpg } from './convert-to-jpg/meta';
import { tool as imageEditor } from './editor/meta';
import { tool as memeGenerator } from './meme-generator/meta';
export const imageGenericTools = [
  imageEditor,
  resizeImage,
  compressImage,
  removeBackground,
  cropImage,
  changeOpacity,
  changeColors,
  createTransparent,
  imageToText,
  qrCodeGenerator,
  rotateImage,
  convertToJpg,
  memeGenerator
];
