import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('csv', {
  name: i18n.t('convertCsvToXml'),
  path: 'csv-to-xml',
  icon: 'mdi-light:xml',
  description: i18n.t('convertCsvToXmlDescription'),
  shortDescription: i18n.t('convertCsvToXmlShortDescription'),
  keywords: ['csv', 'xml', 'convert', 'transform', 'parse'],
  component: lazy(() => import('./index'))
});
