import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Rotate',
  path: 'rotate',
  icon: 'material-symbols-light:rotate-right',
  description:
    "World's simplest browser-based utility for rotating list items. Input your list and specify rotation amount to shift items by a specified number of positions. Perfect for data manipulation, circular shifts, or reordering lists.",
  shortDescription: 'Rotate list items by specified positions',
  keywords: ['rotate'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:rotate.title',
    description: 'list:rotate.description',
    shortDescription: 'list:rotate.shortDescription'
  }
});
