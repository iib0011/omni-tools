import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('number', {
  name: 'Generate numbers',
  path: 'generate',
  shortDescription: 'Quickly calculate a list of integers in your browser',
  // image,
  description:
    'Quickly calculate a list of integers in your browser. To get your list, just specify the first integer, change value and total count in the options below, and this utility will generate that many integers',
  keywords: ['generate'],
  component: lazy(() => import('./index'))
});
