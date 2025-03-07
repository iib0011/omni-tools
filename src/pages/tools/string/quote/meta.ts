import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Quote',
  path: 'quote',
  icon: 'proicons:quote',
  description: '',
  shortDescription: '',
  keywords: ['quote'],
  component: lazy(() => import('./index'))
});
