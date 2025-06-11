import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('video', {
  name: i18n.t('rotateVideo'),
  path: 'rotate',
  icon: 'mdi:rotate-right',
  description: i18n.t('rotateVideoDescription'),
  shortDescription: i18n.t('rotateVideoShortDescription'),
  keywords: ['rotate', 'video', 'flip', 'edit', 'adjust'],
  component: lazy(() => import('./index'))
});
