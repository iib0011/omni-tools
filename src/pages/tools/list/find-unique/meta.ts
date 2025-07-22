import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('list', {
  path: 'find-unique',
  icon: 'material-symbols-light:search',

  keywords: ['find', 'unique'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:findUnique.title',
    description: 'list:findUnique.description',
    shortDescription: 'list:findUnique.shortDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
