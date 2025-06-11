import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('json', {
  name: i18n.t('escapeJson'),
  path: 'escape-json',
  icon: 'lets-icons:json-light',
  description: i18n.t('escapeJsonDescription'),
  shortDescription: i18n.t('escapeJsonShortDescription'),
  longDescription: i18n.t('escapeJsonLongDescription'),
  keywords: ['escape', 'json'],
  component: lazy(() => import('./index'))
});
