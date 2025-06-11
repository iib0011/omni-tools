import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';
// import image from '@assets/text.png';

export const tool = defineTool('gif', {
  name: i18n.t('changeGifSpeed'),
  path: 'change-speed',
  icon: 'material-symbols-light:speed-outline',
  description: i18n.t('changeGifSpeedDescription'),
  shortDescription: i18n.t('changeGifSpeedShortDescription'),
  keywords: ['change', 'speed'],
  component: lazy(() => import('./index'))
});
