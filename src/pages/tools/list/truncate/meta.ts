import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Truncate',
  path: 'truncate',
  // image,
  description: '',
  shortDescription: '',
  keywords: ['truncate'],
  component: lazy(() => import('./index'))
});
