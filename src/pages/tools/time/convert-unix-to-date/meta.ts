import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  i18n: {
    name: 'time:convertUnixToDate.title',
    description: 'time:convertUnixToDate.description',
    shortDescription: 'time:convertUnixToDate.shortDescription'
  },
  path: 'convert-unix-to-date',
  icon: 'material-symbols:schedule',
  keywords: ['convert', 'unix', 'to', 'date'],
  component: lazy(() => import('./index'))
});
