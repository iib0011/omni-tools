import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'repeat',

  icon: 'material-symbols-light:replay',

  keywords: ['text', 'repeat'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:repeat.title',
    description: 'string:repeat.description',
    shortDescription: 'string:repeat.shortDescription'
  }
});
