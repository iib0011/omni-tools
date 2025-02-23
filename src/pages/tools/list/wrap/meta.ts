import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Wrap',
  path: 'wrap',
  // image,
  description: '',
  shortDescription: '',
  keywords: ['wrap'],
  component: lazy(() => import('./index'))
});
