import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('video', {
  name: i18n.t('flipVideo'),
  path: 'flip',
  icon: 'mdi:flip-horizontal',
  description: i18n.t('flipVideoDescription'),
  shortDescription: i18n.t('flipVideoShortDescription'),
  longDescription: i18n.t('flipVideoLongDescription'),
  keywords: ['flip', 'video', 'mirror', 'edit', 'horizontal', 'vertical'],
  component: lazy(() => import('./index'))
});
