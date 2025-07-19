import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  i18n: {
    name: 'string:privatebin.title',
    description: 'string:privatebin.description',
    shortDescription: 'string:privatebin.shortDescription',
    longDescription: 'string:privatebin.longDescription'
  },
  path: 'privatebin',
  icon: 'material-symbols:content-paste',
  keywords: ['privatebin', 'share', 'text', 'secure', 'paste', 'temporary'],
  component: lazy(() => import('./index'))
});
