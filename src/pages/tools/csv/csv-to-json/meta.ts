import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('csv', {
  name: i18n.t('convertCsvToJson'),
  path: 'csv-to-json',
  icon: 'lets-icons:json-light',
  description: i18n.t('convertCsvToJsonDescription'),
  shortDescription: i18n.t('convertCsvToJsonShortDescription'),
  longDescription: i18n.t('convertCsvToJsonLongDescription'),
  keywords: ['csv', 'json', 'convert', 'transform', 'parse'],
  component: lazy(() => import('./index'))
});
