import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  name: 'Convert Images to JPG',
  path: 'convert-to-jpg',
  icon: 'ph:file-jpg-thin',
  description:
    'Convert various image formats (PNG, GIF, TIF, PSD, SVG, WEBP, HEIC, RAW) to JPG with customizable quality and background color settings.',
  shortDescription: 'Convert images to JPG with quality control',
  keywords: [
    'convert',
    'jpg',
    'jpeg',
    'png',
    'gif',
    'tiff',
    'webp',
    'heic',
    'raw',
    'psd',
    'svg',
    'quality',
    'compression'
  ],
  component: lazy(() => import('./index'))
});
