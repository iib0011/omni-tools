import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('video', {
  name: i18n.t('trimVideo'),
  path: 'trim',
  icon: 'mdi:scissors',
  description: i18n.t('trimVideoDescription'),
  shortDescription: i18n.t('trimVideoShortDescription'),
  keywords: ['trim', 'cut', 'video', 'clip', 'edit'],
  component: lazy(() => import('./index'))
});
