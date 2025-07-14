import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:imageToText.title',
    description: 'image:imageToText.description',
    shortDescription: 'image:imageToText.shortDescription'
  },
  name: 'Image to Text (OCR)',
  path: 'image-to-text',
  icon: 'mdi:text-recognition', // Iconify icon as a string
  description:
    'Extract text from images (JPG, PNG) using optical character recognition (OCR).',
  shortDescription: 'Extract text from images using OCR.',
  keywords: [
    'ocr',
    'optical character recognition',
    'image to text',
    'extract text',
    'scan',
    'tesseract',
    'jpg',
    'png'
  ],
  component: lazy(() => import('./index'))
});
