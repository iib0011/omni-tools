import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: i18n.t('reverse'),
  path: 'reverse',
  icon: 'proicons:reverse',
  description: i18n.t('reverseDescription'),
  shortDescription: i18n.t('reverseShortDescription'),
  longDescription: i18n.t('reverseLongDescription'),
  keywords: ['reverse'],
  component: lazy(() => import('./index'))
});
