import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('number', {
  name: 'Number Sum Calculator',
  path: 'sum',
  icon: 'fluent:autosum-20-regular',
  description:
    'Quickly calculate the sum of numbers in your browser. To get your sum, just enter your list of numbers in the input field, adjust the separator between the numbers in the options below, and this utility will add up all these numbers.',
  shortDescription: 'Quickly sum numbers',
  keywords: ['sum'],
  component: lazy(() => import('./index'))
});
