import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('json', {
  name: i18n.t('validateJson'),
  path: 'validateJson',
  icon: 'lets-icons:json-light',
  description: i18n.t('validateJsonDescription'),
  shortDescription: i18n.t('validateJsonShortDescription'),
  longDescription: i18n.t('validateJsonLongDescription'),
  keywords: ['validate', 'json', 'syntax'],
  component: lazy(() => import('./index'))
});
