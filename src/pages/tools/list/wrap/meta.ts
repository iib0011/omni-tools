import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Wrap',
  path: 'wrap',
  icon: 'material-symbols-light:wrap-text',
  description:
    "World's simplest browser-based utility for wrapping list items. Input your list and specify wrapping criteria to organize items into logical groups. Perfect for categorizing data, organizing information, or creating structured lists.",
  shortDescription: 'Wrap list items with specified criteria',
  keywords: ['wrap'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list.wrap.name',
    description: 'list.wrap.description',
    shortDescription: 'list.wrap.shortDescription'
  }
});
