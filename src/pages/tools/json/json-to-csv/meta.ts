import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  path: 'json-to-csv',
  icon: 'material-symbols:code',
  keywords: [],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json:jsonToCsv.title',
    description: 'json:jsonToCsv.description',
    shortDescription: 'json:jsonToCsv.shortDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
