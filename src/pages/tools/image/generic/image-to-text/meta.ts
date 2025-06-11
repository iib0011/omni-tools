import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('image-generic', {
  name: i18n.t('imageToText'),
  path: 'image-to-text',
  icon: 'mdi:text-recognition', // Iconify icon as a string
  description: i18n.t('imageToTextDescription'),
  shortDescription: i18n.t('imageToTextShortDescription'),
  longDescription: i18n.t('imageToTextLongDescription'),
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
