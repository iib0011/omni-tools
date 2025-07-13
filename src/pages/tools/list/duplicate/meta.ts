import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('list', {
  name: 'Duplicate',
  path: 'duplicate',
  icon: 'material-symbols-light:content-copy',
  description:
    "World's simplest browser-based utility for duplicating list items. Input your list and specify duplication criteria to create copies of items. Perfect for data expansion, testing, or creating repeated patterns.",
  shortDescription: 'Duplicate list items with specified criteria',
  keywords: ['duplicate'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:duplicate.title',
    description: 'list:duplicate.description',
    shortDescription: 'list:duplicate.shortDescription'
  }
});
