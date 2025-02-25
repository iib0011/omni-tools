import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Unwrap',
  path: 'unwrap',
  icon: 'mdi:unwrap',
  description: '',
  shortDescription: '',
  keywords: ['unwrap'],
  component: lazy(() => import('./index'))
});
