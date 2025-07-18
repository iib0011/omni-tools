import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'uppercase',
  icon: 'material-symbols-light:format-textdirection-l-to-r',

  keywords: ['uppercase'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:uppercase.title',
    description: 'string:uppercase.description',
    shortDescription: 'string:uppercase.shortDescription',
    userTypes: ['General Users', 'Students', 'Developers']
  }
});
