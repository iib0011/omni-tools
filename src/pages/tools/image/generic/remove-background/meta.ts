import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('image-generic', {
  name: i18n.t('removeBackground'),
  path: 'remove-background',
  icon: 'mdi:image-remove',
  description: i18n.t('removeBackgroundDescription'),
  shortDescription: i18n.t('removeBackgroundShortDescription'),
  longDescription: i18n.t('removeBackgroundLongDescription'),
  keywords: [
    'remove',
    'background',
    'png',
    'transparent',
    'image',
    'ai',
    'jpg'
  ],
  component: lazy(() => import('./index'))
});
