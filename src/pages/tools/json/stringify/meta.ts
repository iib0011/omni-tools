import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  path: 'stringify',
  icon: 'material-symbols:code',

  keywords: ['json', 'stringify', 'serialize', 'convert'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json:stringify.title',
    description: 'json:stringify.description',
    shortDescription: 'json:stringify.shortDescription',
    userTypes: ['Developers']
  }
});
