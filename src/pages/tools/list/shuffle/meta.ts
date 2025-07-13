import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Shuffle',
  path: 'shuffle',
  icon: 'material-symbols-light:shuffle',
  description:
    "World's simplest browser-based utility for shuffling list items. Input your list and instantly get a randomized version with items in random order. Perfect for creating variety, testing randomness, or mixing up ordered data.",
  shortDescription: 'Randomize the order of list items',
  keywords: ['shuffle'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:shuffle.title',
    description: 'list:shuffle.description',
    shortDescription: 'list:shuffle.shortDescription'
  }
});
