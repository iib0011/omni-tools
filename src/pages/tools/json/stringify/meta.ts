import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('json', {
  name: i18n.t('stringifyJson'),
  path: 'stringify',
  icon: 'ant-design:field-string-outlined',
  description: i18n.t('stringifyJsonDescription'),
  shortDescription: i18n.t('stringifyJsonShortDescription'),
  longDescription: i18n.t('stringifyJsonLongDescription'),
  keywords: [
    'stringify',
    'serialize',
    'convert',
    'object',
    'array',
    'json',
    'string'
  ],
  component: lazy(() => import('./index'))
});
