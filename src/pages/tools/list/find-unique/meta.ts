import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Find unique',
  path: 'find-unique',
  icon: 'mynaui:one',
  description: '',
  shortDescription: '',
  keywords: ['find', 'unique'],
  component: lazy(() => import('./index'))
});
