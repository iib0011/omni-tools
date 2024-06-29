import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('json', {
  name: 'Prettify',
  path: 'prettify',
  // image,
  description: '',
  shortDescription: '',
  keywords: ['prettify'],
  component: lazy(() => import('./index'))
});