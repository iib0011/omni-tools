import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Palindrome',
  path: 'palindrome',
  // image,
  description: '',
  shortDescription: '',
  keywords: ['palindrome'],
  component: lazy(() => import('./index'))
});