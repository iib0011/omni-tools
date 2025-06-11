import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: i18n.t('shuffle'),
  path: 'shuffle',
  icon: 'material-symbols-light:shuffle',
  description: i18n.t('shuffleDescription'),
  shortDescription: i18n.t('shuffleShortDescription'),
  keywords: ['shuffle'],
  component: lazy(() => import('./index'))
});
