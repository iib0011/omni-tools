import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Extract substring',
  path: 'extract-substring',
  icon: '',
  description: '',
  shortDescription: '',
  keywords: ['extract', 'substring'],
  component: lazy(() => import('./index'))
});
