import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Rot13',
  path: 'rot13',
  // image,
  description: '',
  shortDescription: '',
  keywords: ['rot13'],
  component: lazy(() => import('./index'))
});