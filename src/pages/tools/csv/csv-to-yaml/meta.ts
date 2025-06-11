import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('csv', {
  name: i18n.t('convertCsvToYaml'),
  path: 'csv-to-yaml',
  icon: 'nonicons:yaml-16',
  description: i18n.t('convertCsvToYamlDescription'),
  shortDescription: i18n.t('convertCsvToYamlShortDescription'),
  longDescription: i18n.t('convertCsvToYamlLongDescription'),
  keywords: ['csv', 'to', 'yaml'],
  component: lazy(() => import('./index'))
});
