import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('date', {
  name: 'Convert days to hours',
  path: 'convert-days-to-hours',
  icon: '',
  description: '',
  shortDescription: '',
  keywords: ['convert', 'days', 'to', 'hours'],
  component: lazy(() => import('./index'))
});
