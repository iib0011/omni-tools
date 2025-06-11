import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('image-generic', {
  name: i18n.t('compressImage'),
  path: 'compress',
  component: lazy(() => import('./index')),
  icon: 'material-symbols-light:compress-rounded',
  description: i18n.t('compressImageDescription'),
  shortDescription: i18n.t('compressImageShortDescription'),
  keywords: ['image', 'compress', 'reduce', 'quality']
});
