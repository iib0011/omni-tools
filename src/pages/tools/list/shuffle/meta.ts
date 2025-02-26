import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Shuffle',
  path: 'shuffle',
  icon: 'material-symbols-light:shuffle',
  description: '',
  shortDescription: '',
  keywords: ['shuffle'],
  component: lazy(() => import('./index'))
});
