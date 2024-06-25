import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('number', {
  name: 'Generate',
  path: 'generate',
  // image,
  description: '',
  keywords: ['generate'],
  component: lazy(() => import('./index'))
});