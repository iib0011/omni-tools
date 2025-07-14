import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'reverse',
  icon: 'material-symbols-light:swap-horiz',

  keywords: ['reverse'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:reverse.title',
    description: 'string:reverse.description',
    shortDescription: 'string:reverse.shortDescription'
  }
});
