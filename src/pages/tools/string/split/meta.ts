import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'split',
  icon: 'material-symbols-light:call-split',

  keywords: ['split'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:split.title',
    description: 'string:split.description',
    shortDescription: 'string:split.shortDescription'
  }
});
