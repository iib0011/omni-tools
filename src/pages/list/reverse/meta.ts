import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Reverse',
  path: 'reverse',
  // image,
  description: '',
  shortDescription: '',
  keywords: ['reverse'],
  component: lazy(() => import('./index'))
});
