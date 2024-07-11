import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Randomize case',
  path: 'randomize-case',
  // image,
  description: '',
  shortDescription: '',
  keywords: ['randomize', 'case'],
  component: lazy(() => import('./index'))
});