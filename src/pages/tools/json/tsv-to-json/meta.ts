import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('json', {
  name: i18n.t('tsvToJson'),
  path: 'tsv-to-json',
  icon: 'material-symbols:tsv-rounded',
  description: i18n.t('tsvToJsonDescription'),
  shortDescription: i18n.t('tsvToJsonShortDescription'),
  longDescription: i18n.t('tsvToJsonLongDescription'),
  keywords: ['tsv', 'json', 'convert', 'transform', 'parse'],
  component: lazy(() => import('./index'))
});
