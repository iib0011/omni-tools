import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('list', {
  name: 'Find unique',
  path: 'find-unique',
  icon: 'material-symbols-light:search',
  description:
    "World's simplest browser-based utility for finding unique items in a list. Input your list and instantly get all unique values with duplicates removed. Perfect for data cleaning, deduplication, or finding distinct elements.",
  shortDescription: 'Find unique items in a list',
  keywords: ['find', 'unique'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list.findUnique.name',
    description: 'list.findUnique.description',
    shortDescription: 'list.findUnique.shortDescription'
  }
});
