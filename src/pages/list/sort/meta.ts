import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Sort',
  path: 'sort',
  // image,
  description: '',
  shortDescription: '',
  keywords: ['sort'],
  component: lazy(() => import('./index'))
});