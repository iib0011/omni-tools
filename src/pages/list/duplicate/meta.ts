import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Duplicate',
  path: 'duplicate',
  // image,
  description: '',
  shortDescription: '',
  keywords: ['duplicate'],
  component: lazy(() => import('./index'))
});