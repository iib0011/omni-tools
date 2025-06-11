import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('json', {
  name: i18n.t('minifyJSON'),
  path: 'minify',
  icon: 'lets-icons:json-light',
  description: i18n.t('minifyJSONDescription'),
  shortDescription: i18n.t('minifyJSONShortDescription'),
  longDescription: i18n.t('minifyJSONLongDescription'),
  keywords: ['minify', 'compress', 'minimize', 'json', 'compact'],
  component: lazy(() => import('./index'))
});
