import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: i18n.t('unwrap'),
  path: 'unwrap',
  icon: 'mdi:unwrap',
  description: i18n.t('unwrapDescription'),
  shortDescription: i18n.t('unwrapShortDescription'),
  longDescription: i18n.t('unwrapLongDescription'),
  keywords: ['unwrap'],
  component: lazy(() => import('./index'))
});
