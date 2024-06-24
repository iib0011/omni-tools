import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import image from '@assets/text.png';

export const tool = defineTool('png', {
  name: 'Change colors in png',
  path: 'change-colors-in-png',
  image,
  description: '',
  keywords: ['change', 'colors', 'in', 'png'],
  component: lazy(() => import('./index'))
});
