import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('video', {
  name: i18n.t('cropVideo'),
  path: 'crop-video',
  icon: 'mdi:crop',
  description: i18n.t('cropVideoDescription'),
  shortDescription: i18n.t('cropVideoShortDescription'),
  longDescription: i18n.t('cropVideoLongDescription'),
  keywords: ['crop', 'video', 'trim', 'cut', 'resize'],
  component: lazy(() => import('./index'))
});
