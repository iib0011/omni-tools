import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Rotate',
  path: 'rotate',
  icon: 'material-symbols-light:rotate-right',
  description: '',
  shortDescription: '',
  keywords: ['rotate'],
  component: lazy(() => import('./index'))
});
