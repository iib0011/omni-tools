import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Find most popular',
  path: 'find-most-popular',
  icon: 'material-symbols-light:query-stats',
  description: '',
  shortDescription: '',
  keywords: ['find', 'most', 'popular'],
  component: lazy(() => import('./index'))
});
