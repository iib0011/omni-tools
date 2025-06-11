import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: i18n.t('sortList'),
  path: 'sort',
  icon: 'basil:sort-outline',
  description: i18n.t('sortListDescription'),
  shortDescription: i18n.t('sortListShortDescription'),
  keywords: ['sort'],
  component: lazy(() => import('./index'))
});
