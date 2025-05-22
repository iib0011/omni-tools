import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Change speed',
  path: 'change-speed',
  icon: '',
  description: '',
  shortDescription: '',
  keywords: ['change', 'speed'],
  longDescription: '',
  component: lazy(() => import('./index'))
});