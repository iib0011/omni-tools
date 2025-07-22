import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('list', {
  path: 'group',
  icon: 'pajamas:group',

  keywords: ['group'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:group.title',
    description: 'list:group.description',
    shortDescription: 'list:group.shortDescription',
    userTypes: ['General Users', 'Developers']
  }
});
