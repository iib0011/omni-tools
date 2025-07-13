import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Unwrap',
  path: 'unwrap',
  icon: 'material-symbols-light:unfold-more',
  description:
    "World's simplest browser-based utility for unwrapping list items. Input your wrapped list and specify unwrapping criteria to flatten organized items. Perfect for data processing, text manipulation, or extracting content from structured lists.",
  shortDescription: 'Unwrap list items from structured format',
  keywords: ['unwrap'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list.unwrap.name',
    description: 'list.unwrap.description',
    shortDescription: 'list.unwrap.shortDescription'
  }
});
