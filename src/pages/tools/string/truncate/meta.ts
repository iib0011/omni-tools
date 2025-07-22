import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'truncate',
  icon: 'material-symbols-light:content-cut',

  keywords: ['truncate'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:truncate.title',
    description: 'string:truncate.description',
    shortDescription: 'string:truncate.shortDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
