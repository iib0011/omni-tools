import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Uppercase',
  path: 'uppercase',
  icon: '',
  description: '',
  shortDescription: '',
  keywords: ['uppercase'],
  component: lazy(() => import('./index'))
});
