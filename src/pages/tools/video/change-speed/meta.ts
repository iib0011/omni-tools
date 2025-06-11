import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('video', {
  name: i18n.t('changeSpeed'),
  path: 'change-speed',
  icon: 'material-symbols-light:speed-outline',
  description: i18n.t('changeSpeedDescription'),
  shortDescription: i18n.t('changeSpeedShortDescription'),
  keywords: ['change', 'speed'],
  component: lazy(() => import('./index'))
});
