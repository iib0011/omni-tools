import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: i18n.t('wrap'),
  path: 'wrap',
  icon: 'mdi:wrap',
  description: i18n.t('wrapDescription'),
  shortDescription: i18n.t('wrapShortDescription'),
  longDescription: i18n.t('wrapLongDescription'),
  keywords: ['wrap'],
  component: lazy(() => import('./index'))
});
