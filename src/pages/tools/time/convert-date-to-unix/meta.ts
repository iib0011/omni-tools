import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  i18n: {
    name: 'time:convertDateToUnix.title',
    description: 'time:convertDateToUnix.description',
    shortDescription: 'time:convertDateToUnix.shortDescription'
  },
  path: 'convert-date-to-unix',
  icon: 'qlementine-icons:update-16',
  keywords: ['convert', 'date', 'to', 'unix'],
  component: lazy(() => import('./index'))
});
