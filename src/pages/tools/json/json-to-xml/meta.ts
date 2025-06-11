import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('json', {
  name: i18n.t('jsonToXml'),
  path: 'json-to-xml',
  icon: 'mdi-light:xml',
  description: i18n.t('jsonToXmlDescription'),
  shortDescription: i18n.t('jsonToXmlShortDescription'),
  keywords: ['json', 'xml', 'convert', 'transform', 'parse'],
  component: lazy(() => import('./index'))
});
