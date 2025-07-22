import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'join',

  icon: 'material-symbols-light:join',

  keywords: ['text', 'join'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:join.title',
    description: 'string:join.description',
    shortDescription: 'string:join.shortDescription',
    userTypes: ['General Users']
  }
});
