import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Find most popular',
  path: 'find-most-popular',
  icon: 'material-symbols-light:trending-up',
  description:
    "World's simplest browser-based utility for finding the most popular items in a list. Input your list and instantly get the items that appear most frequently. Perfect for data analysis, trend identification, or finding common elements.",
  shortDescription: 'Find most frequently occurring items',
  keywords: ['find', 'most', 'popular'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:findMostPopular.title',
    description: 'list:findMostPopular.description',
    shortDescription: 'list:findMostPopular.shortDescription'
  }
});
