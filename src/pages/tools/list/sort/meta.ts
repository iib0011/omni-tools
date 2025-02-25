import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Sort',
  path: 'sort',
  icon: 'basil:sort-outline',
  description:
    'This is a super simple browser-based application that sorts items in a list and arranges them in increasing or decreasing order. You can sort the items alphabetically, numerically, or by their length. You can also remove duplicate and empty items, as well as trim individual items that have whitespace around them. You can use any separator character to separate the input list items or alternatively use a regular expression to separate them. Additionally, you can create a new delimiter for the sorted output list.',
  shortDescription: 'Quickly sort a list',
  keywords: ['sort'],
  component: lazy(() => import('./index'))
});
