import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('json', {
  name: i18n.t('prettifyJson'),
  path: 'prettify',
  icon: 'lets-icons:json-light',
  description: i18n.t('prettifyJsonDescription'),
  shortDescription: i18n.t('prettifyJsonShortDescription'),
  longDescription: i18n.t('prettifyJsonLongDescription'),
  keywords: ['prettify'],
  component: lazy(() => import('./index'))
});
