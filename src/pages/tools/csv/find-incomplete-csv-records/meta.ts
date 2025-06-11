import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('csv', {
  name: i18n.t('findIncompleteCsvRecords'),
  path: 'find-incomplete-csv-records',
  icon: 'tdesign:search-error',
  description: i18n.t('findIncompleteCsvRecordsDescription'),
  shortDescription: i18n.t('findIncompleteCsvRecordsShortDescription'),
  longDescription: i18n.t('findIncompleteCsvRecordsLongDescription'),
  keywords: ['find', 'incomplete', 'csv', 'records'],
  component: lazy(() => import('./index'))
});
