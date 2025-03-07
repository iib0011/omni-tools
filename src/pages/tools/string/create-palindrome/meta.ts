import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Create palindrome',
  path: 'create-palindrome',
  icon: '',
  description: '',
  shortDescription: '',
  keywords: ['create', 'palindrome'],
  component: lazy(() => import('./index'))
});
