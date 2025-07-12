import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Find most popular',
  path: 'find-most-popular',
  icon: 'material-symbols-light:query-stats',
  description:
    'A tool to identify and count the most frequently occurring items in a list. Useful for data analysis, finding trends, or identifying common elements.',
  shortDescription: 'Find most common items in a list.',
  keywords: ['find', 'most', 'popular'],
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
