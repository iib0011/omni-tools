import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'table-text-converter',
  icon: 'fluent:table-cell-center-arrow-repeat-all-20-regular',
  keywords: [
    'table',
    'text',
    'converter',
    'markdown',
    'csv',
    'html',
    'mysql',
    'json'
  ],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:tableTextConverter.title',
    description: 'string:tableTextConverter.description',
    shortDescription: 'string:tableTextConverter.shortDescription',
    longDescription: 'string:tableTextConverter.longDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
