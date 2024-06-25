import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'String To morse',
  path: 'to-morse',
  // image,
  description: '',
  keywords: ['to', 'morse'],
  component: lazy(() => import('./index'))
});
