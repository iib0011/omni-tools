import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  path: 'find-incomplete-csv-records',
  icon: 'tdesign:search-error',

  keywords: ['find', 'incomplete', 'csv', 'records'],

  component: lazy(() => import('./index')),
  i18n: {
    name: 'csv:findIncompleteCsvRecords.title',
    description: 'csv:findIncompleteCsvRecords.description',
    shortDescription: 'csv:findIncompleteCsvRecords.shortDescription',
    userTypes: ['Developers']
  }
});
