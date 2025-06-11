import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('image-generic', {
  name: i18n.t('resizeImage'),
  path: 'resize',
  icon: 'mdi:resize', // Iconify icon as a string
  description: i18n.t('resizeImageDescription'),
  shortDescription: i18n.t('resizeImageShortDescription'),
  longDescription: i18n.t('resizeImageLongDescription'),
  keywords: [
    'resize',
    'image',
    'scale',
    'jpg',
    'png',
    'svg',
    'gif',
    'dimensions'
  ],
  component: lazy(() => import('./index'))
});
