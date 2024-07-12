import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Rotate',
  path: 'rotate',
  // image,
  description: '',
  shortDescription: '',
  keywords: ['rotate'],
  component: lazy(() => import('./index'))
});