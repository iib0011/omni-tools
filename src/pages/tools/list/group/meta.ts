import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('list', {
  name: 'Group',
  path: 'group',
  icon: 'pajamas:group',
  description:
    "World's simplest browser-based utility for grouping list items. Input your list and specify grouping criteria to organize items into logical groups. Perfect for categorizing data, organizing information, or creating structured lists. Supports custom separators and various grouping options.",
  shortDescription: 'Group list items by common properties',
  keywords: ['group'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:group.title',
    description: 'list:group.description',
    shortDescription: 'list:group.shortDescription'
  }
});
