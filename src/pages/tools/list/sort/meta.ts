import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Sort',
  path: 'sort',
  icon: 'material-symbols-light:sort',
  description:
    "World's simplest browser-based utility for sorting list items. Input your list and specify sorting criteria to organize items in ascending or descending order. Perfect for data organization, text processing, or creating ordered lists.",
  shortDescription: 'Sort list items in specified order',
  keywords: ['sort'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list.sort.name',
    description: 'list.sort.description',
    shortDescription: 'list.sort.shortDescription'
  }
});
