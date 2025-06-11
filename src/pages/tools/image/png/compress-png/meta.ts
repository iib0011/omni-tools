import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';
// import image from '@assets/text.png';

export const tool = defineTool('png', {
  name: i18n.t('compressPng'),
  path: 'compress-png',
  icon: 'material-symbols-light:compress',
  description: i18n.t('compressPngDescription'),
  shortDescription: i18n.t('compressPngShortDescription'),
  keywords: ['compress', 'png'],
  component: lazy(() => import('./index'))
});
