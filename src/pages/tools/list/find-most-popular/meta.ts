import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: i18n.t('findMostPopular'),
  path: 'find-most-popular',
  icon: 'material-symbols-light:query-stats',
  description: i18n.t('findMostPopularDescription'),
  shortDescription: i18n.t('findMostPopularShortDescription'),
  keywords: ['find', 'most', 'popular'],
  component: lazy(() => import('./index'))
});
