import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('image-generic', {
  name: i18n.t('cropImage'),
  path: 'crop',
  icon: 'mdi:crop', // Iconify icon as a string
  description: i18n.t('cropImageDescription'),
  shortDescription: i18n.t('cropImageShortDescription'),
  longDescription: i18n.t('cropImageLongDescription'),
  keywords: ['crop', 'image', 'edit', 'resize', 'trim'],
  component: lazy(() => import('./index'))
});
